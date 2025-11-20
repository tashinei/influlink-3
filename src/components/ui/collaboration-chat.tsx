import { Send, CheckCheck, Clock, Bell } from "lucide-react";

interface CollaborationChatProps {
  userType?: "creator" | "brand";
}

export function CollaborationChat({ userType = "creator" }: CollaborationChatProps) {
  const isCreator = userType === "creator";
  
  const messages = isCreator ? [
    { 
      sender: "brand", 
      text: "Hi! Your recent content performance is impressive. We have a $1,200 partnership opportunity. Expires in 3 hours.", 
      time: "2:41 PM",
      status: "read"
    },
    { 
      sender: "creator", 
      text: "Thank you! I would love to discuss this further.", 
      time: "2:43 PM",
      status: "read"
    },
    { 
      sender: "brand", 
      text: "Excellent. Contract ready for review. Accepting today includes a $600 advance payment upon signing.", 
      time: "2:44 PM",
      status: "read"
    },
    { 
      sender: "creator", 
      text: "Reviewed and signed. Looking forward to working together!", 
      time: "2:46 PM",
      status: "delivered"
    },
  ] : [
    { 
      sender: "brand", 
      text: "Hello Sarah! Your audience matches our target perfectly. We have an urgent campaign with a $2,000 budget.", 
      time: "11:22 AM",
      status: "read"
    },
    { 
      sender: "creator", 
      text: "Hello! I am available. Could you share the campaign details?", 
      time: "11:24 AM",
      status: "read"
    },
    { 
      sender: "brand", 
      text: "Product launch tomorrow. Need 3 stories + 1 reel. Instant confirmation available if you can start today.", 
      time: "11:25 AM",
      status: "read"
    },
    { 
      sender: "creator", 
      text: "Perfect timing. Please send the campaign brief and I will begin immediately.", 
      time: "11:27 AM",
      status: "delivered"
    },
  ];

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Chat Header */}
      <div className="bg-muted/50 border-b border-border p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-primary-foreground">
          {isCreator ? "B" : "J"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {isCreator ? "Brand" : "John Doe"}
          </p>
          <p className="text-[10px] text-muted-foreground">Active now</p>
        </div>
        <div className="relative">
          <Bell className="w-5 h-5 text-foreground" />
          <div className="absolute -top-[0.4rem] right-[0.01rem] bg-gradient-to-r from-primary to-secondary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            137+
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => {
          const isSent = isCreator ? msg.sender === "creator" : msg.sender === "brand";
          return (
            <div key={idx} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${isSent ? "order-2" : "order-1"}`}>
                <div
                  className={`rounded-2xl px-3 py-2 ${
                    isSent
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-[11px] leading-relaxed">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[9px] text-muted-foreground">{msg.time}</span>
                  {isSent && (
                    msg.status === "read" ? (
                      <CheckCheck className="w-3 h-3 text-primary" />
                    ) : (
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
