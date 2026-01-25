// server.js (ES Modules)
import "dotenv/config";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createNotification } from "./src/utils/notifications.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const isProduction = process.env.NODE_ENV === "production";

import multer from "multer";
const upload = multer({ dest: path.join(__dirname, "uploads/") });

// --- Middleware ---
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Database Connection Pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Connected to MariaDB/MySQL database via Pool!");
    conn.release();
  })
  .catch((err) => console.error("❌ Database connection failed:", err.message));

// =======================
// AUTH ROUTES
// =======================

// Generate base handle from name
const generateHandleFromName = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "") // remove spaces
    .replace(/[^a-z0-9]/g, ""); // remove special chars
};

// Ensure handle is unique in DB
const generateUniqueHandle = async (baseHandle) => {
  let handle = baseHandle;
  let count = 0;

  while (true) {
    const [rows] = await pool.query(
      "SELECT id FROM profiles WHERE handle = ?",
      [handle]
    );
    if (rows.length === 0) return handle;
    count++;
    handle = `${baseHandle}${count}`;
  }
};

app.post("/api/register", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let {
      name, email, password, accountType,
      analytics, marketing,
      handle, location, bio,
      niche, platforms, languages, content_types, collab_types
    } = req.body;

    if (!email || !password || !handle || !accountType) {
      return res.status(400).json({ message: "Missing required registration fields" });
    }

    const cleanHandle = handle.replace(/^@/, '').toLowerCase().trim();

    const [existing] = await connection.query(
      `SELECT u.email, p.handle 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.id 
       WHERE u.email = ? OR p.handle = ?`,
      [email, cleanHandle]
    );

    if (existing.length > 0) {
      const isEmailTaken = existing.some(row => row.email === email);
      return res.status(409).json({
        message: isEmailTaken ? "Email already registered" : "Handle is already taken"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await connection.query(
      `INSERT INTO users 
      (name, email, password_hash, account_type, created_at, gdpr_consent, consent_analytics, consent_marketing, consent_date) 
      VALUES (?, ?, ?, ?, NOW(), 1, ?, ?, NOW())`,
      [name, email, hashedPassword, accountType, analytics ? 1 : 0, marketing ? 1 : 0]
    );
    const newUserId = userResult.insertId;

    if (accountType === 'creator') {
      await connection.query(
        `INSERT INTO profiles 
        (id, name, handle, type, location, niche, bio, platforms, languages, content_types, collab_types, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          newUserId,
          name,
          cleanHandle,
          'creator',
          location || null,
          niche || null,
          bio || null,
          JSON.stringify(platforms || []),
          JSON.stringify(languages || []),
          JSON.stringify(languages || []),
          JSON.stringify(content_types || []),
          JSON.stringify(collab_types || [])
        ]
      );
    } else {
      await connection.query(
        `INSERT INTO profiles (id, name, handle, type, location, bio, content_types, collab_types, created_at) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?,NOW())`,
        [newUserId, name, cleanHandle, 'brand', location || null, bio || null, JSON.stringify([]), JSON.stringify([])]
      );
    }

    await connection.commit();

    const token = jwt.sign(
      { id: newUserId, email, accountType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 9. Set HttpOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 10. Final Response (Matches your Zustand Store needs)
    res.status(201).json({
      message: "Account created successfully",
      token, // Also returned in body for non-cookie environments
      user: {
        id: newUserId,
        email,
        username: cleanHandle,
        accountType,
        isVIP: false
      },
    });

  } catch (err) {
    // If anything fails, undo all database changes
    await connection.rollback();
    console.error("Unified Registration error:", err);
    res.status(500).json({ message: "Internal server error during registration." });
  } finally {
    // Release connection back to pool
    connection.release();
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password, analytics, marketing } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, accountType: user.account_type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (analytics !== undefined || marketing !== undefined) {
      await pool.query(
        "UPDATE users SET gdpr_consent = 1, consent_analytics = ?, consent_marketing = ?, consent_date = NOW() WHERE id = ?",
        [analytics ? 1 : 0, marketing ? 1 : 0, user.id]
      );
    }

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Logged in successfully",
      user: { id: user.id, email: user.email, accountType: user.account_type },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Middleware to verify JWT from cookie
const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });

  // Respond with 204 No Content for successful deletion or 200 OK
  // The frontend is expecting a successful response (status 200/204) to redirect.
  res.status(200).json({ message: "Logged out successfully" });
});

// =======================
// PROFILE ROUTES
// =======================
const formatNumberShort = (num) => {
  // Ensure num is a number
  const n = Number(num) || 0;

  // Numbers below 1,000 are returned as-is (e.g., 999)
  if (n < 1000) {
    return n.toString();
  }

  // Thousands (K)
  if (n >= 1000 && n < 1000000) {
    // Divide by 1000 and round to 1 decimal place if needed
    const val = n / 1000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "K";
  }

  // Millions (M)
  if (n >= 1000000) {
    // Divide by 1,000,000 and round to 1 decimal place
    const val = n / 1000000;
    return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + "M";
  }
};

// Get profile (UPDATED: Added isFollowing status)
app.get("/api/profiles/:profileId", authenticate, async (req, res) => {
  try {
    const { profileId } = req.params;
    const currentUserId = req.user.id;

    let query, queryParam;

    if (!isNaN(Number(profileId))) {
      query = "SELECT * FROM profiles WHERE id = ?";
      queryParam = profileId;
    } else {
      // It's a string handle (e.g., "johndoe" or "@johndoe")
      // Clean the handle by removing an optional leading '@'
      const cleanedHandle = profileId.startsWith("@")
        ? profileId.substring(1)
        : profileId;
      query = "SELECT * FROM profiles WHERE handle = ?";
      queryParam = cleanedHandle;
    }

    // 1. Fetch Profile Data
    const [rows] = await pool.query(query, [queryParam]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });

    const profile = rows[0];

    const [followStatus] = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM user_follows WHERE follower_user_id = ? AND following_profile_id = ?) AS isFollowing",
      [currentUserId, profile.id]
    );
    const isFollowing = followStatus[0].isFollowing === 1;

    // 3. Format Response
    const formattedProfile = {
      id: profile.id.toString(),
      name: profile.name,
      handle: profile.handle,
      type: profile.type,
      niche: profile.niche,
      location: profile.location,
      verified: profile.verified === 1,
      bio: profile.bio,
      avatar: profile.avatar,
      isVIP: profile.isVIP === 1,
      isFollowing: isFollowing,
      stats: {
        followers: Number(profile.followers || 0),
        following: Number(profile.following || 0),
        engagementRate: Number(profile.engagement_rate || 0), // just the numeric rate
        totalReach: Number(profile.total_reach || 0),
      },
      platforms: [], // empty array if not in DB
      contentTypes: [],
      collabTypes: [],
      socialLinks: JSON.parse(profile.social_links_json || "{}"),
    };

    res.json(formattedProfile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile data" });
  }
});

// Toggle follow
app.post("/api/profiles/:profileId/follow", authenticate, async (req, res) => {
  const { profileId } = req.params;
  const followerId = req.user.id;

  if (String(followerId) === profileId) {
    return res.status(400).json({ message: "Cannot follow your own profile" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Check if the user is already following the profile
    const [existingFollow] = await connection.query(
      "SELECT * FROM user_follows WHERE follower_user_id = ? AND following_profile_id = ?",
      [followerId, profileId]
    );

    const isCurrentlyFollowing = existingFollow.length > 0;
    let message;

    if (isCurrentlyFollowing) {
      // UNFOLLOW
      await connection.query(
        "DELETE FROM user_follows WHERE follower_user_id = ? AND following_profile_id = ?",
        [followerId, profileId]
      );
      // Decrement profile's follower count
      await connection.query(
        "UPDATE profiles SET followers = GREATEST(followers - 1, 0) WHERE id = ?",
        [profileId]
      );
      message = "Unfollowed successfully";
    } else {
      // FOLLOW
      await connection.query(
        "INSERT INTO user_follows (follower_user_id, following_profile_id) VALUES (?, ?)",
        [followerId, profileId]
      );
      // Increment profile's follower count
      await connection.query(
        "UPDATE profiles SET followers = followers + 1 WHERE id = ?",
        [profileId]
      );
      message = "Followed successfully";
    }

    // Get the updated count for the response
    const [updatedProfile] = await connection.query(
      "SELECT followers FROM profiles WHERE id = ?",
      [profileId]
    );

    await connection.commit();

    res.json({
      message: message,
      isFollowing: !isCurrentlyFollowing, // Send the new status
      followers: updatedProfile[0].followers, // Send the new count
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error toggling follow:", err);
    res.status(500).json({ message: "Failed to update follow status" });
  } finally {
    if (connection) connection.release();
  }
});

// Get portfolio
app.get(
  "/api/profiles/:profileId/portfolio",
  authenticate,
  async (req, res) => {
    const { profileId } = req.params;
    try {
      const [rows] = await pool.query(
        "SELECT * FROM portfolio WHERE profile_id = ? ORDER BY id DESC",
        [profileId]
      );

      const formatted = rows.map((item) => ({
        id: item.id.toString(),
        profileId: item.profile_id.toString(),
        title: item.title,
        brand: item.brand,
        type: item.type,
        description: item.description,
        image: item.image,
        createdAt: item.created_at,
        stats: {
          likes: item.likes || 0, // send numeric value
          views: item.views || 0, // send numeric value
        },
      }));

      res.json(formatted);
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  }
);
// Add portfolio post
app.post(
  "/api/profiles/:profileId/portfolio",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    const { profileId } = req.params;
    const { title, brand, type, description } = req.body;

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const imagePath = `/uploads/${req.file.filename}`;
      const defaultStats = { likes: 0, views: 0 };

      const [result] = await pool.query(
        `INSERT INTO portfolio 
         (profile_id, title, brand, type, image, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [profileId, title, brand, type, imagePath, description]
      );

      res.status(201).json({
        id: result.insertId.toString(),
        title,
        brand,
        type,
        description,
        image: imagePath,
        stats: defaultStats,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error adding portfolio post:", err);
      res.status(500).json({ message: "Failed to add portfolio post" });
    }
  }
);

// Delete portfolio post
app.delete(
  "/api/profiles/:profileId/portfolio/:postId",
  authenticate,
  async (req, res) => {
    const { profileId, postId } = req.params;
    try {
      const [result] = await pool.query(
        "DELETE FROM portfolio WHERE id = ? AND profile_id = ?",
        [postId, profileId]
      );
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "Post not found or unauthorized" });
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting portfolio post:", err);
      res.status(500).json({ message: "Failed to delete post" });
    }
  }
);

// Like/unlike portfolio post
app.post(
  "/api/profiles/:profileId/portfolio/:postId/like",
  authenticate,
  async (req, res) => {
    const { postId } = req.params;
    try {
      // Increment likes by 1 (or create a separate likes table if needed)
      const [result] = await pool.query(
        "UPDATE portfolio SET likes = likes + 1 WHERE id = ?",
        [postId]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Post not found" });

      // Return new likes count
      const [updatedRows] = await pool.query(
        "SELECT likes FROM portfolio WHERE id = ?",
        [postId]
      );
      res.json({ likes: updatedRows[0].likes });
    } catch (err) {
      console.error("Error liking post:", err);
      res.status(500).json({ message: "Failed to like post" });
    }
  }
);

// Optional: unlike
app.delete(
  "/api/profiles/:profileId/portfolio/:postId/like",
  authenticate,
  async (req, res) => {
    const { postId } = req.params;
    try {
      const [result] = await pool.query(
        "UPDATE portfolio SET likes = GREATEST(likes - 1, 0) WHERE id = ?",
        [postId]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Post not found" });

      const [updatedRows] = await pool.query(
        "SELECT likes FROM portfolio WHERE id = ?",
        [postId]
      );
      res.json({ likes: updatedRows[0].likes });
    } catch (err) {
      console.error("Error unliking post:", err);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  }
);

app.post(
  "/api/profiles/:profileId/portfolio/:postId/like",
  authenticate,
  async (req, res) => {
    const { profileId, postId } = req.params;
    try {
      const [rows] = await pool.query(
        "SELECT likes FROM portfolio WHERE id = ? AND profile_id = ?",
        [postId, profileId]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: "Post not found" });

      const newLikes = (rows[0].likes || 0) + 1;
      await pool.query("UPDATE portfolio SET likes = ? WHERE id = ?", [
        newLikes,
        postId,
      ]);

      res.json({ likes: newLikes });
    } catch (err) {
      console.error("Error liking post:", err);
      res.status(500).json({ message: "Failed to like post" });
    }
  }
);

// Unlike a post
app.delete(
  "/api/profiles/:profileId/portfolio/:postId/like",
  authenticate,
  async (req, res) => {
    const { profileId, postId } = req.params;
    try {
      const [rows] = await pool.query(
        "SELECT likes FROM portfolio WHERE id = ? AND profile_id = ?",
        [postId, profileId]
      );
      if (rows.length === 0)
        return res.status(404).json({ message: "Post not found" });

      const newLikes = Math.max((rows[0].likes || 0) - 1, 0);
      await pool.query("UPDATE portfolio SET likes = ? WHERE id = ?", [
        newLikes,
        postId,
      ]);

      res.json({ likes: newLikes });
    } catch (err) {
      console.error("Error unliking post:", err);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  }
);

// Get analytics
app.get(
  "/api/profiles/:profileId/analytics",
  authenticate,
  async (req, res) => {
    const { profileId } = req.params;

    try {
      const [portfolioTotals] = await pool.query(
        "SELECT SUM(likes) AS totalLikes, SUM(views) AS totalViews FROM portfolio WHERE profile_id = ?",
        [profileId]
      );

      const totalLikes = Number(portfolioTotals[0].totalLikes || 0);
      const totalViews = Number(portfolioTotals[0].totalViews || 0);

      const [topPostsRows] = await pool.query(
        "SELECT id, title, (likes + views) as engagement FROM portfolio WHERE profile_id = ? ORDER BY engagement DESC LIMIT 5",
        [profileId]
      );

      const topPerformingPosts = topPostsRows.map((post) => ({
        id: post.id.toString(),
        title: post.title,
        engagement: Number(post.engagement),
      }));

      // 3. Prepare Chart Data (Using the live totals for placeholders)
      const viewsByPlatform = [
        { platform: "Web", views: Math.round(totalViews * 0.7) },
        { platform: "Mobile", views: Math.round(totalViews * 0.3) },
      ];

      // trend charts
      const engagementOverTime = [];
      const reachTrend = [];

      const analyticsData = {
        // Live Totals (used by key metrics)
        totalLikes: totalLikes.toString(),
        totalViews: totalViews.toString(),

        // Chart/List data (used by charts and list)
        engagementOverTime,
        viewsByPlatform,
        reachTrend,
        topPerformingPosts,

        newFollowersCount: 0,
      };

      res.json(analyticsData);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  }
);

app.post(
  "/api/profiles/me/avatar",
  authenticate,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const avatarPath = `/uploads/${req.file.filename}`; // path to save in DB

      await pool.query("UPDATE profiles SET avatar = ? WHERE id = ?", [
        avatarPath,
        req.user.id,
      ]);

      // Return updated profile
      const [rows] = await pool.query("SELECT * FROM profiles WHERE id = ?", [
        req.user.id,
      ]);
      if (rows.length === 0)
        return res.status(404).json({ message: "Profile not found" });

      res.json({ ...rows[0], avatar: avatarPath });
    } catch (err) {
      console.error("Error updating avatar:", err);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  }
);

const analyticsBuffer = {}; // { [profileId]: { views: number, likes: number } }

function bufferAnalytics(profileId, type = "views", amount = 1) {
  if (!analyticsBuffer[profileId])
    analyticsBuffer[profileId] = { views: 0, likes: 0 };
  analyticsBuffer[profileId][type] += amount;
}

const postViewsBuffer = {};
// { [postId]: number of pending views }

function bufferPostView(postId, amount = 1) {
  if (!postViewsBuffer[postId]) postViewsBuffer[postId] = 0;
  postViewsBuffer[postId] += amount;
}

setInterval(async () => {
  const analyticsEntries = Object.entries(analyticsBuffer);
  const postEntries = Object.entries(postViewsBuffer);

  if (analyticsEntries.length === 0 && postEntries.length === 0) return;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // --- 1. Flush post views ---
    for (const [postId, pendingViews] of postEntries) {
      await connection.query(
        "UPDATE portfolio SET views = views + ? WHERE id = ?",
        [pendingViews, postId]
      );
    }

    // --- 2. Flush profile analytics (reach + engagement rate) ---
    for (const [profileId, { views, likes }] of analyticsEntries) {
      const reachIncrement = views + likes;
      await connection.query(
        "UPDATE profiles SET total_reach = total_reach + ? WHERE id = ?",
        [reachIncrement, profileId]
      );

      const [totalsRows] = await connection.query(
        "SELECT SUM(likes) AS totalLikes, SUM(views) AS totalViews FROM portfolio WHERE profile_id = ?",
        [profileId]
      );

      const totalLikes = Number(totalsRows[0].totalLikes || 0);
      const totalViews = Number(totalsRows[0].totalViews || 0);

      const [followersRows] = await connection.query(
        "SELECT followers FROM profiles WHERE id = ?",
        [profileId]
      );
      const followersCount = Number(followersRows[0]?.followers || 0);

      let rawRate =
        followersCount > 0 ? (totalLikes + totalViews) / followersCount : 0;
      if (followersCount < 50) rawRate *= 0.5;
      const engagementRatePercent = Math.min(rawRate * 100, 100).toFixed(1);

      await connection.query(
        "UPDATE profiles SET engagement_rate = ? WHERE id = ?",
        [engagementRatePercent, profileId]
      );
    }

    await connection.commit();

    // Clear buffers
    analyticsEntries.forEach(
      ([profileId]) => delete analyticsBuffer[profileId]
    );
    postEntries.forEach(([postId]) => delete postViewsBuffer[postId]);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Batch update failed", err);
  } finally {
    if (connection) connection.release();
  }
}, 60_000); // every 60s

// Increment views and update engagement rate
app.post(
  "/api/profiles/:profileId/portfolio/:postId/view",
  authenticate,
  async (req, res) => {
    const { profileId, postId } = req.params;
    try {
      // 1. Buffer profile analytics (reach)
      bufferAnalytics(profileId, "views", 1);

      // 2. Buffer post views
      bufferPostView(postId, 1);

      res.json({ message: "View recorded (buffered)" });
    } catch (err) {
      console.error("Error recording view:", err);
      res.status(500).json({ message: "Failed to record view" });
    }
  }
);

const FOLLOWER_RANGES = {
  nano: { min: 0, max: 10_000 },
  micro: { min: 10_001, max: 100_000 },
  mid: { min: 100_001, max: 500_000 },
  macro: { min: 500_001, max: 1_000_000 },
  mega: { min: 1_000_001, max: null }, // no upper limit
};

// =======================
// CREATOR SEARCH ROUTE
// =======================
app.post("/api/creators/search", async (req, res) => {
  try {
    console.log("Just a test");
    const {
      query = "",
      niche = [],
      country = "",
      language = [],
      platforms = [],
      minFollowers = 0,
      maxFollowers = 10000000,
      isVIP = false,
      availableNow = false,
      budgetMin = 0,
      budgetMax = 100000000,
      page = 1,
      limit = 12,
      minEngagement,
      maxEngagement,
      contentTypes = [],
      collabTypes = [],
    } = req.body;

    console.log("Received body:", req.body);

    const where = [];
    const params = [];

    // Only creators
    // where.push(`accounttype = 'creator'`);

    // 🔍 Text search
    if (query.trim()) {
      where.push(`(
        name LIKE ? OR
        handle LIKE ? OR
        bio LIKE ? OR
        niche LIKE ? OR
        location LIKE ? OR
        country LIKE ? OR
        JSON_SEARCH(collab_types, 'one', ?) IS NOT NULL OR
        JSON_SEARCH(content_types, 'one', ?) IS NOT NULL OR
        JSON_SEARCH(platforms, 'one', ?) IS NOT NULL
    )`);

      const q = `%${query}%`;
      params.push(q, q, q, q, q, q, q, q, q);
    }

    // Niche
    if (niche.length > 0) {
      where.push(`niche IN (${niche.map(() => "?").join(",")})`);
      params.push(...niche);
    }

    // Country
    if (country) {
      where.push(`country = ?`);
      params.push(country); // we only pass the country name string
    }

    // Availability
    if (availableNow) {
      where.push(`available_now = 1`);
    }

    // Vip status
    if (isVIP) {
      where.push(`isVip = 1`);
    }

    const languages = Array.isArray(req.body.language) ? req.body.language : [];

    // Language
    if (languages.length > 0) {
      const orClauses = languages
        .map(() => `JSON_SEARCH(LOWER(languages), 'one', LOWER(?)) IS NOT NULL`)
        .join(" OR ");
      where.push(`(${orClauses})`);
      params.push(...languages);
    }

    // Platforms
    if (platforms?.length > 0) {
      const orClauses = platforms
        .map(() => `JSON_CONTAINS(platforms, ?)`)
        .join(" OR ");
      where.push(`(${orClauses})`);
      params.push(...platforms.map((platform) => `"${platform}"`));
    }

    // Followers (range OR explicit)
    let minF = minFollowers ?? 0;
    let maxF = maxFollowers ?? 10000000;

    console.log("Using follower limits:", minF, maxF);

    if (minF >= 0) {
      where.push(`followers >= ?`);
      params.push(minF);
    }
    if (maxF <= 10000000) {
      where.push(`followers <= ?`);
      params.push(maxF);
    }

    let minEng = minEngagement ?? 0;
    let maxEng = maxEngagement ?? 100;

    if (minEng >= 0) {
      where.push(`engagement_rate >= ?`);
      params.push(minEng);
    }
    if (maxEng <= 100) {
      where.push(`engagement_rate <= ?`);
      params.push(maxEng);
    }

    if (contentTypes.length > 0) {
      const orClauses = contentTypes
        .map(() => `JSON_CONTAINS(content_types, ?)`)
        .join(" OR ");

      where.push(`(${orClauses})`);
      params.push(...contentTypes.map((t) => `"${t.toLowerCase()}"`));
    }

    if (collabTypes.length > 0) {
      const orClauses = collabTypes
        .map(() => `JSON_CONTAINS(collab_types, ?)`)
        .join(" OR ");

      where.push(`(${orClauses})`);
      params.push(...collabTypes.map((t) => `"${t.toLowerCase()}"`));
    }

    // 💰 Budget (custom numeric)
    // if (budgetMin !== null) {
    //     where.push(`budget_min >= ?`);
    //     params.push(budgetMin);
    // }

    // if (budgetMax !== null) {
    //     where.push(`budget_max <= ?`);
    //     params.push(budgetMax);
    // }

    // 📄 Pagination
    const offset = (page - 1) * limit;

    const sql = `
      SELECT
        id,
        name,
        handle,
        niche,
        location,
        avatar,
        followers,
        engagement_rate,
        isVIP,
        budget_min,
        budget_max,
        country,
        languages,
        platforms,
        content_types,
        collab_types
      FROM profiles
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY
        isVIP DESC,
        followers DESC
      LIMIT ? OFFSET ?
    `;

    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);

    res.json({
      page,
      limit,
      count: rows.length,
      results: rows,
    });

    console.log(rows);
  } catch (err) {
    console.error("Creator search error:", err);
    res.status(500).json({ message: "Failed to search creators" });
  }
});

// =======================
// UPDATE PROFILE ROUTE
// =======================
app.post("/api/profiles/me/update", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    let { name, bio, niche, location } = req.body;

    // Fetch current profile
    const [rows] = await pool.query("SELECT * FROM profiles WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });

    const currentProfile = rows[0];

    // Use current name if none provided
    if (!name || name.trim() === "") {
      name = currentProfile.name;
    }

    // Use current bio/niche/location if missing
    bio = bio ?? currentProfile.bio;
    niche = niche ?? currentProfile.niche;
    location = location ?? currentProfile.location;

    // Generate unique handle only if the name changed
    let handle = currentProfile.handle;
    if (name !== currentProfile.name) {
      const baseHandle = generateHandleFromName(name);
      handle = await generateUniqueHandle(baseHandle);
    }

    // Update profile
    await pool.query(
      `UPDATE profiles 
            SET name = ?, bio = ?, niche = ?, location = ?, handle = ?
            WHERE id = ?`,
      [name, bio, niche, location, handle, userId]
    );

    // Fetch updated profile
    const [updatedRows] = await pool.query(
      "SELECT * FROM profiles WHERE id = ?",
      [userId]
    );

    if (updatedRows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Return updated profile
    const profile = updatedRows[0];

    res.json({
      message: "Profile updated successfully",
      profile: {
        id: profile.id,
        name: profile.name,
        handle: profile.handle,
        bio: profile.bio,
        niche: profile.niche,
        location: profile.location,
        avatar: profile.avatar,
        type: profile.type,
        isVIP: profile.isVIP,
        followers: profile.followers,
        following: profile.following,
      },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// =======================
// CAMPAIGN ROUTES
// =======================

// Create a campaign
app.post(
  "/api/campaigns/create",
  authenticate,
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "referenceImages", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const {
        name,
        description,
        type,
        date,
        budget,
        goal,
        platforms,
        niches,
        contentTypes,
        country,
        language,
      } = req.body;

      // Validate required fields
      if (!name || !description || !type || !date || !budget || !goal) {
        return res
          .status(400)
          .json({ message: "Missing required campaign fields" });
      }

      // Parse JSON arrays
      let parsedPlatforms = [];
      let parsedNiches = [];
      let parsedContentTypes = [];
      let parsedLanguage = [];

      try {
        parsedPlatforms = platforms ? JSON.parse(platforms) : [];
        parsedNiches = niches ? JSON.parse(niches) : [];
        parsedContentTypes = contentTypes ? JSON.parse(contentTypes) : [];
        parsedLanguage = language ? JSON.parse(language) : [];
      } catch (err) {
        return res.status(400).json({ message: "Invalid JSON format in arrays" });
      }

      // Handle uploaded files
      const companyLogo = req.files["companyLogo"]?.[0]
        ? `/uploads/${req.files["companyLogo"][0].filename}`
        : null;

      const referenceImages =
        req.files["referenceImages"]?.map(
          (file) => `/uploads/${file.filename}`
        ) || [];

      // Insert campaign into DB
      const [result] = await pool.query(
        `INSERT INTO campaigns 
          (brand_id, name, description, type, start_date, budget, goal,
           platforms, niches, contentTypes, country, language, company_logo, reference_images, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId,
          name,
          description,
          type,
          date,
          budget,
          goal,
          JSON.stringify(parsedPlatforms),
          JSON.stringify(parsedNiches),
          JSON.stringify(parsedContentTypes),
          country,
          JSON.stringify(parsedLanguage),
          companyLogo,
          JSON.stringify(referenceImages),
        ]
      );

      const campaignId = result.insertId;

      res.status(201).json({
        message: "Campaign created successfully",
        campaign: {
          id: campaignId,
          name,
          description,
          type,
          date,
          budget,
          goal,
          platforms: parsedPlatforms,
          niches: parsedNiches,
          contentTypes: parsedContentTypes,
          country,
          language: parsedLanguage,
          companyLogo,
          referenceImages,
        },
      });
    } catch (err) {
      console.error("Error creating campaign:", err);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  }
);


app.get("/api/campaigns", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT * FROM campaigns WHERE brand_id = ? ORDER BY created_at DESC",
      [userId]
    );

    console.log(rows);

    const campaigns = rows.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      type: c.type,
      status: c.status,
      budget: c.budget,
      budgetSpent: c.budget_spent,
      impressions: c.impressions,
      reach: c.reach,

      // normalize
      startDate: c.start_date,
      companyLogo: c.company_logo,
      referenceImages: c.reference_images ? JSON.parse(c.reference_images) : [],
      platforms: c.platforms ? JSON.parse(c.platforms) : [],
      language: c.language ? JSON.parse(c.language) : [],
      contentTypes: c.contentTypes ? JSON.parse(c.contentTypes) : [],
      country: c.country,
      niches: c.niches ? JSON.parse(c.niches) : [],
    }));

    res.json(campaigns);
  } catch (err) {
    console.error("Failed to fetch campaigns:", err);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
});

// DELETE campaign by ID
app.delete("/api/campaigns/:profileId/:campaignId", async (req, res) => {
  const { profileId, campaignId } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM campaigns WHERE id = ? AND brand_id = ?",
      [campaignId, profileId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Campaign not found or not yours" });
    }

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("Failed to delete campaign:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

const formatMySQLDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toISOString().slice(0, 19).replace("T", " ");
};

app.put(
  "/api/campaigns/:id",
  authenticate,
  upload.fields([
    { name: "companyLogo", maxCount: 1 },
    { name: "referenceImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const campaignId = req.params.id;

      /** ---------- OWNERSHIP CHECK ---------- */
      const [rows] = await pool.query(
        "SELECT * FROM campaigns WHERE id = ? AND brand_id = ?",
        [campaignId, userId]
      );

      if (!rows.length) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      const campaign = rows[0];

      /** ---------- BODY ---------- */
      const {
        name,
        description,
        type,
        status,
        primaryGoal,
        budget,
        startDate,
      } = req.body;

      /** ---------- FILES ---------- */
      const logoFile = req.files?.companyLogo?.[0];
      const newImages = req.files?.referenceImages || [];

      const removedImagesRaw = req.body["removedImages[]"];
      const removedImages = removedImagesRaw
        ? Array.isArray(removedImagesRaw)
          ? removedImagesRaw
          : [removedImagesRaw]
        : [];

      /** ---------- HANDLE LOGO ---------- */
      let companyLogo = campaign.company_logo;
      if (logoFile) {
        companyLogo = `/uploads/${logoFile.filename}`;
      }

      /** ---------- HANDLE REFERENCE IMAGES ---------- */
      const existingImages = campaign.reference_images
        ? JSON.parse(campaign.reference_images)
        : [];

      // remove deleted images
      const filteredImages = existingImages.filter(
        (img) => !removedImages.includes(img)
      );

      // delete removed images from disk
      removedImages.forEach((img) => {
        const filePath = img.startsWith("/") ? img.slice(1) : img;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // add new images
      const uploadedImages = newImages.map(
        (f) => `/uploads/${f.filename}`
      );

      const finalImages = [...filteredImages, ...uploadedImages];

      /** ---------- UPDATE ---------- */
      await pool.query(
        `
        UPDATE campaigns SET
          name = ?,
          description = ?,
          type = ?,
          status = ?,
          budget = ?,
          start_date = ?,
          company_logo = ?,
          reference_images = ?
        WHERE id = ?
        `,
        [
          name,
          description,
          type,
          status,
          Number(budget),
          formatMySQLDate(startDate),
          companyLogo,
          JSON.stringify(finalImages),
          campaignId,
        ]
      );

      /** ---------- RESPONSE ---------- */
      res.json({
        success: true,
        campaign: {
          id: campaignId,
          name,
          description,
          type,
          status,
          budget: Number(budget),
          startDate,
          companyLogo,
          referenceImages: finalImages,
        },
      });
    } catch (err) {
      console.error("Failed to update campaign:", err);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  }
);

app.post("/api/:userId/campaigns/:campaignId/impression", async (req, res) => {
  const { userId, campaignId } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Attempt to insert the unique viewer.
    // If (campaign_id, creator_id) already exists, it does nothing.
    const [insertResult] = await conn.query(
      `INSERT IGNORE INTO campaign_impressions (campaign_id, creator_id) VALUES (?, ?)`,
      [campaignId, userId]
    );

    console.log(insertResult);
    console.log(insertResult.affectedRows);

    /**
     * KEY LOGIC:
     * affectedRows === 1 means a BRAND NEW user was recorded.
     * affectedRows === 0 means this user has seen it before.
     */
    if (insertResult.affectedRows === 1) {
      // ONLY increment REACH if the user is truly new
      // We increment impressions here too for the very first view
      await conn.query(
        `UPDATE campaigns 
         SET reach = reach + 1, 
             impressions = impressions + 1 
         WHERE id = ?`,
        [campaignId]
      );
    } else {
      // If the user already exists, ONLY increment impressions
      // This is what prevents Reach from climbing on reload!
      await conn.query(
        `UPDATE campaigns 
         SET impressions = impressions + 1 
         WHERE id = ?`,
        [campaignId]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: "Failed to track" });
  } finally {
    conn.release();
  }
});

app.post("/api/campaigns/search", authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // get the authenticated user
    const {
      query,
      niches,
      platforms,
      contentTypes,
      collabTypes,
      country,
      language,
      budgetRange,
      status,
      sortBy,
      page = 1,
      limit = 12,
    } = req.body;

    const offset = (page - 1) * limit;

    // Build WHERE conditions dynamically
    const where = [];
    const params = [];

    if (query) {
      where.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${query}%`, `%${query}%`);
    }

    const buildJsonContains = (field, values) => {
      if (!values || values.length === 0) return;
      const conditions = values.map(() => `JSON_CONTAINS(${field}, ?)`);
      where.push(`(${conditions.join(" OR ")})`);
      values.forEach((v) => params.push(`"${v}"`));
    };

    buildJsonContains("niches", niches);
    buildJsonContains("platforms", platforms);
    buildJsonContains("contentTypes", contentTypes);
    buildJsonContains("collabTypes", collabTypes);
    buildJsonContains("language", language);

    if (country) {
      where.push("country = ?");
      params.push(country);
    }

    if (budgetRange) {
      switch (budgetRange) {
        case "low":
          where.push("budget <= 100");
          break;
        case "mid":
          where.push("budget BETWEEN 100 AND 1000");
          break;
        case "high":
          where.push("budget > 1000");
          break;
      }
    }

    if (status && status !== "any") {
      where.push("status = ?");
      params.push(status);
    }

    const whereSQL = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    // Count total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as count FROM campaigns ${whereSQL}`,
      params
    );
    const total = countResult[0].count;

    // Fetch campaigns with hasApplied info
    const [results] = await pool.query(
      `
      SELECT c.*, 
        EXISTS(
          SELECT 1 FROM proposals p 
          WHERE p.campaign_id = c.id AND p.creator_id = ?
        ) AS hasApplied
      FROM campaigns c
      ${whereSQL}
      ORDER BY ${sortBy === "budget" ? "budget DESC" : "start_date DESC"}
      LIMIT ? OFFSET ?
      `,
      [userId, ...params, Number(limit), Number(offset)]
    );

    // Normalize campaigns and parse JSON fields
    const campaigns = results.map((c) => ({
      ...c,
      referenceImages: c.reference_images ? JSON.parse(c.reference_images) : [],
      platforms: c.platforms ? JSON.parse(c.platforms) : [],
      language: c.language ? JSON.parse(c.language) : [],
      contentTypes: c.contentTypes ? JSON.parse(c.contentTypes) : [],
      niches: c.niches ? JSON.parse(c.niches) : [],
      hasApplied: c.hasApplied === 1,
    }));

    console.log("Search results:", campaigns);

    res.json({ count: total, results: campaigns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to search campaigns" });
  }
});

app.post("/api/proposals", authenticate, async (req, res) => {
  try {
    const { campaignId, message, deliverables, proposedPrice } = req.body;
    const creatorId = req.user?.id;

    if (!creatorId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!campaignId || !message) {
      return res.status(400).json({ error: "campaignId and message are required" });
    }

    if (message.length < 20 || message.length > 2000) {
      return res.status(400).json({ error: "Invalid message length" });
    }

    if (proposedPrice !== undefined) {
      const price = Number(proposedPrice);
      if (Number.isNaN(price) || price < 0) {
        return res.status(400).json({ error: "Invalid proposed price" });
      }
    }

    const [[campaign]] = await pool.query(
      `SELECT id, brand_id, status FROM campaigns WHERE id = ?`,
      [campaignId]
    );

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.status !== "open") {
      return res.status(400).json({ error: "Campaign is not open" });
    }

    if (campaign.brand_id === creatorId) {
      return res.status(403).json({ error: "Cannot apply to your own campaign" });
    }

    const [result] = await pool.query(
      `INSERT INTO proposals 
       (campaign_id, creator_id, message, deliverables, proposed_price, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [campaignId, creatorId, message, deliverables || null, proposedPrice || null]
    );

    console.log("Sending proposal:", {
      campaignId,
      message,
      messageLength: message?.length,
    });
    const proposalId = result.insertId;

    await createNotification(pool, {
      userId: campaign.brand_id,
      type: "proposal_received",
      title: "New proposal received",
      message: "A creator has applied to your campaign.",
      entityType: "proposal",
      entityId: proposalId,
    });

    res.json({ success: true, proposalId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "You have already applied to this campaign" });
    }

    console.error(err);
    res.status(500).json({ error: "Failed to submit proposal" });
  }
});

app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    console.log("Authenticated user:", req.user); // <--- add this
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, type, title, message, entity_type, entity_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 30`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications", authenticate, async (req, res) => {
  try {
    const { user_id, type, title, message, entity_type, entity_id } = req.body;

    // Use your existing helper function
    await createNotification(pool, {
      userId: user_id,
      type,
      title,
      message,
      entityType: entity_type,
      entityId: entity_id,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to create notification:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/proposals/:id/action", authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const proposalId = req.params.id;
    const { action } = req.body; // "accept" or "decline"
    const userId = req.user.id;

    await connection.beginTransaction();

    // 1. Verify the proposal exists and the current user owns the campaign
    const [[proposal]] = await connection.query(
      `SELECT p.*, c.brand_id 
       FROM proposals p 
       JOIN campaigns c ON p.campaign_id = c.id 
       WHERE p.id = ?`,
      [proposalId]
    );

    if (!proposal) return res.status(404).json({ error: "Proposal not found" });
    if (proposal.brand_id !== userId) return res.status(403).json({ error: "Unauthorized" });

    // 2. Update the status
    const newStatus = action === "accept" ? "accepted" : "rejected";
    await connection.query(
      "UPDATE proposals SET status = ? WHERE id = ?",
      [newStatus, proposalId]
    );

    // 3. Create the Notification for the creator who sent the proposal
    const notificationType = action === "accept" ? "proposal_accepted" : "proposal_rejected";
    const title = action === "accept" ? "Proposal accepted!" : "Proposal declined";
    const message = action === "accept"
      ? "Your proposal has been accepted. Get ready to collaborate!"
      : "Unfortunately, your proposal was not selected this time.";

    await createNotification(connection, {
      userId: proposal.creator_id, // The applicant
      type: notificationType,
      title: title,
      message: message,
      entityType: "proposal",
      entityId: proposalId,
    });

    await connection.commit();
    res.json({ success: true, status: newStatus });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to process proposal action" });
  } finally {
    connection.release();
  }
});

app.post("/api/invites/:id/action", authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const inviteId = req.params.id;
    const { action } = req.body; // "accept" or "decline"
    const userId = req.user.id; // This is the Creator's ID

    await connection.beginTransaction();

    // 1. Verify the invite exists and belongs to this creator
    const [[invite]] = await connection.query(
      `SELECT ci.*, c.name as campaign_name, c.brand_id 
       FROM campaign_invitations ci
       JOIN campaigns c ON ci.campaign_id = c.id
       WHERE ci.id = ?`,
      [inviteId]
    );

    if (!invite) {
      return res.status(404).json({ error: "Invite not found" });
    }

    // Security check: Only the invited creator can accept/decline
    if (invite.creator_id !== userId) {
      return res.status(403).json({ error: "Unauthorized: You were not the recipient of this invite" });
    }

    // 2. Update the status
    const newStatus = action === "accept" ? "accepted" : "declined";
    await connection.query(
      "UPDATE campaign_invitations SET status = ? WHERE id = ?",
      [newStatus, inviteId]
    );

    // 3. Create the Notification for the Brand (the sender)
    const notificationType = action === "accept" ? "invite_accepted" : "invite_declined";
    const title = action === "accept" ? "Invite Accepted!" : "Invite Declined";
    const message = action === "accept"
      ? `A creator has accepted your invitation to join "${invite.campaign_name}".`
      : `A creator has declined your invitation for "${invite.campaign_name}".`;

    await createNotification(connection, {
      userId: invite.brand_id, // The Brand owner who sent the invite
      type: notificationType,
      title: title,
      message: message,
      entityType: "campaign_invite",
      entityId: inviteId,
    });

    await connection.commit();
    res.json({ success: true, status: newStatus });

  } catch (err) {
    await connection.rollback();
    console.error("Error processing invite action:", err);
    res.status(500).json({ error: "Failed to process invite action" });
  } finally {
    connection.release();
  }
});

app.get("/api/proposals/:id", authenticate, async (req, res) => {
  try {
    const proposalId = req.params.id;
    console.log("Proposal id received: ", proposalId);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [[proposal]] = await pool.query(
      `SELECT 
         p.id,
         p.campaign_id,
         p.creator_id,
         p.message,
         p.deliverables,
         p.proposed_price,
         p.status,
         p.created_at,
         u.name AS creator_name
       FROM proposals p
       JOIN users u ON p.creator_id = u.id
       WHERE p.id = ?`,
      [proposalId]
    );

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    // Optional: Only allow the campaign owner or the creator to view
    const [[campaign]] = await pool.query(
      `SELECT brand_id FROM campaigns WHERE id = ?`,
      [proposal.campaign_id]
    );

    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    if (campaign.brand_id !== userId && proposal.creator_id !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(proposal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch proposal details" });
  }
});

app.get("/api/notifications/unread-count", authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT COUNT(*) AS count FROM notifications 
       WHERE user_id = ? AND is_read = 0`,
      [req.user.id]
    );
    res.json({ count: row.count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
});

app.post("/api/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const [result] = await pool.query(
      `UPDATE notifications
       SET is_read = 1
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    console.log("READ CHANGED!");

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

app.post("/api/notifications/read-all", authenticate, async (req, res) => {
  const userId = req.user.id;

  await pool.query(
    `UPDATE notifications
     SET is_read = 1
     WHERE user_id = ? AND is_read = 0`,
    [userId]
  );

  res.json({ success: true });
});

app.post("/api/campaigns/invite", authenticate, async (req, res) => {
  try {
    const brandId = req.user.id;
    const { creatorId, campaignId, message } = req.body;

    if (!creatorId || !campaignId) {
      return res.status(400).json({ error: "Missing creatorId or campaignId" });
    }

    // 1. Verify campaign ownership
    const [campaigns] = await pool.query(
      `SELECT id, name FROM campaigns WHERE id = ? AND brand_id = ?`,
      [campaignId, brandId]
    );

    if (campaigns.length === 0) {
      return res.status(403).json({ error: "Unauthorized campaign access" });
    }

    const campaign = campaigns[0];

    // 2. Insert invitation
    await pool.query(
      `INSERT IGNORE INTO campaign_invitations
       (campaign_id, creator_id, brand_id, message)
       VALUES (?, ?, ?, ?)`,
      [campaignId, creatorId, brandId, message || null]
    );

    // 3. Notification (short & readable)
    await pool.query(
      `INSERT INTO notifications
       (user_id, type, title, message, entity_type, entity_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        creatorId,
        "campaign_invite",
        "Campaign Invitation",
        message
          ? message.slice(0, 140)
          : `You've been invited to collaborate on "${campaign.name}".`,
        "campaign",
        campaignId
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ error: "Failed to send invite" });
  }
});

app.get('/api/invite/:id', authenticate, async (req, res) => {
  const inviteId = req.params.id;
  const userId = req.user.id;

  try {
    const [invites] = await pool.execute(
      `SELECT 
                ci.*, 
                c.name AS campaign_name, 
                c.description AS campaign_description,
                c.budget AS campaign_budget,
                c.brand_id
             FROM campaign_invitations ci
             JOIN campaigns c ON ci.campaign_id = c.id
             WHERE ci.id = ? AND ci.creator_id = ?`,
      [inviteId, userId]
    );

    if (invites.length === 0) {
      return res.status(404).json({ error: "Invite not found or unauthorized" });
    }

    const invite = invites[0];

    res.json({
      id: invite.id,
      campaign_id: invite.campaign_id,
      brand_id: invite.brand_id, // This matches your frontend's inviteData.brand_id
      message: invite.message,
      status: invite.status,
      campaign_name: invite.campaign_name,
      campaign_description: invite.campaign_description,
      campaign_budget: invite.campaign_budget,
      created_at: invite.created_at,
      logo: invite.avatar,
    });

  } catch (error) {
    console.error("Database error fetching invite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/consent/update', async (req, res) => {
  const { email, analytics, marketing } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  try {
    const query = `
            UPDATE users 
            SET 
                gdpr_consent = 1,
                consent_analytics = ?, 
                consent_marketing = ?, 
                consent_date = NOW()
            WHERE email = ?
        `;

    const [result] = await pool.execute(query, [
      analytics ? 1 : 0,
      marketing ? 1 : 0,
      email
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Preferences saved successfully" });
  } catch (error) {
    console.error("Database Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/links", authenticate, async (req, res) => {
  const userId = req.user.id;
  const accountType = req.user.accountType;

  try {
    let sql = "";
    let params = [];

    if (accountType === "brand") {
      sql = `
        /* 1. Master Campaigns */
        SELECT 'campaign' as linkType, c.id, c.id as campaignId, c.name as title, c.status, 
               'Master Campaign' as category, c.created_at, c.company_logo, c.budget, c.type
        FROM campaigns c WHERE c.brand_id = ?
        
        UNION ALL

        /* 2. Sent Invitations */
        SELECT 'invitation' as linkType, i.id, c.id as campaignId, c.name as title, i.status, 
               'Sent Invite' as category, i.created_at, c.company_logo, c.budget, c.type
        FROM campaign_invitations i
        JOIN campaigns c ON i.campaign_id = c.id
        WHERE i.brand_id = ?

        UNION ALL

        /* 3. Active Deals (Accepted Proposals) */
        SELECT 'deal' as linkType, p.id, c.id as campaignId, c.name as title, 'active' as status, 
               'Active Deal' as category, p.updated_at as created_at, c.company_logo, c.budget, c.type
        FROM proposals p
        JOIN campaigns c ON p.campaign_id = c.id
        WHERE c.brand_id = ? AND p.status = 'accepted'
        
        ORDER BY created_at DESC
      `;
      params = [userId, userId, userId];
    } else {
      sql = `
        /* 1. My Proposals */
        SELECT 'proposal' as linkType, p.id, c.id as campaignId, c.name as title, p.status, 
               'My Proposal' as category, p.created_at, c.company_logo, c.budget, c.type
        FROM proposals p
        JOIN campaigns c ON p.campaign_id = c.id
        WHERE p.creator_id = ?

        UNION ALL

        /* 2. Received Invitations */
        SELECT 'invitation' as linkType, i.id, c.id as campaignId, c.name as title, i.status, 
               'Received Invite' as category, i.created_at, c.company_logo, c.budget, c.type
        FROM campaign_invitations i
        JOIN campaigns c ON i.campaign_id = c.id
        WHERE i.creator_id = ?

        UNION ALL

        /* 3. Active Deals (Accepted Invites) */
        SELECT 'deal' as linkType, i.id, c.id as campaignId, c.name as title, 'active' as status, 
               'Active Deal' as category, i.created_at, c.company_logo, c.budget, c.type
        FROM campaign_invitations i
        JOIN campaigns c ON i.campaign_id = c.id
        WHERE i.creator_id = ? AND i.status = 'accepted'

        ORDER BY created_at DESC
      `;
      params = [userId, userId, userId];
    }

    const [rows] = await pool.query(sql, params);

    const formatted = rows.map(row => ({
      id: row.id.toString(),
      campaignId: row.campaignId.toString(),
      title: row.title,
      status: row.status,
      category: row.category,
      date: new Date(row.created_at).toLocaleDateString(),
      linkType: row.linkType,
      // Enhanced Data
      logo: row.company_logo,
      budget: row.budget,
      type: row.type
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching rich links:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`\n🎉 Backend running on http://localhost:${PORT}`);
  console.log(`   (MariaDB port: ${process.env.DB_PORT})`);
});
