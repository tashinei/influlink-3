export const translations = {
  bg: {
    hero: {
      title: "Присъединете се към бъдещето на",
      highlightText: "инфлуенсър маркетинга",
      description:
        "Запишете се в чакащата листа за ранен достъп до първата българска платформа",
      creatorButton: "Създател",
      brandButton: "Бизнес",
    },

    nav: {
      home: "Начало",
      contact: "Контакти",
      brandAbout: "За бизнеси",
      creatorAbout: "За създатели"
    },

    common: {
      back: "Назад",
      next: "Напред",
      submit: "Изпрати",
      loading: "Изпращане...",
    },

    about: {
      creator: {
        createdForFirstPart: "Създадена за",
        createdForSecondPart: "Вас",
      },
      brand: {
        createdForFirstPart: "Създадена за",
        createdForSecondPart: "Вашия бизнес",
      }
    },

    form: {
      arrays: {
        creatorNiches: [
          "Мода",
          "Красота",
          "Технологии",
          "Пътувания",
          "Фитнес",
          "Храна",
          "Гейминг",
          "Образование",
          "Комедия",
          "Начин на живот",
          "Храна и напитки",
          "Семейство и деца",
          "Изкуство",
          "Фотография",
          "Музика и танци",
          "Модел",
          "Животни и домашни любимци",
          "Приключения и на открито",
          "Предприемачество и бизнес",
          "Спортист и спорт",
          "Здравеопазване",
          "Актьор",
          "Автомобили",
          "Веган",
          "Знаменитост и обществена личност",
          "Друго"
        ],
        brandCategories: ["Онлайн магазин", "Физически магазин", "Услуги", "Ресторант/Кафене", "Хотел / Туризъм ", "Уебсайт / Приложение", "Друго"],
        creatorCollabOptions: ["Продуктово ревю", "Гласова реклама", "UGC видео", "Публикация", "Стори", "Друго"],
        brandCollabOptions: ["Кратко видео", "Ревю", "Ънбоксинг", "UGC реклама", "Фото пост", "Гласово видео", "Друго"],
      },
      stepNames: {
        creator: [
          "Основна информация",
          "Категория и ниша",
          "Държава и аудитория",
          "Начини за колаборация",
          "Платформа и последователи",
          "Вашата аудитория",
        ],
        brand: [
          "Основна информация",
          "Категория и тип",
          "Държави",
          "Сектор / ниша",
          "Вашите клиенти",
        ],
      },
      stepIndicator: {
        step: "Стъпка",
      },

      titles: {
        brands: "Регистрация за бизнеси",
        creators: "Регистрация за създатели"
      },

      leftSide: {
        title: "Станете част от бъдещето",
        brandsSubText: "Свържете се с най-добрите създатели на съдържание в България",
        creatorsSubText: "Свържете се с най-известните марки в България"
      },

      steps: {
        1: {
          title: "Основна информация",
          description:
            "Попълнете Вашите данни, за да създадем Вашия профил във InfluAi.",
        },
        2: {
          title: "Какъв тип бизнес сте?",
          description:
            "Изберете сферата, в която се развива Вашият бранд.",
        },
        3: {
          title: "В кой сектор/ниша оперирате?",
          description:
            "Изберете как искате да работите със създатели.",
        },
        4: {
          title: "В кой сектор/ниша оперирате?",
          description:
            "Помогнете ни да Ви свържем с най-подходящите създатели.",
          helperText:
            "Ще използваме тази информация, за да Ви предложим най-подходящите създатели.",
        },
        5: {
          title: "Вашите клиенти",
          description:
            "Потвърдете, че всичко е наред, преди да изпратите.",
        },

        // Creator-only steps
        creator2: {
          title: "Коя е Вашата ниша?",
          description:
            "Изберете нишата, към която принадлежи Вашето съдържание.",
        },
        creator3: {
          title: "Жанр на съдържанието",
          description: "Изберете основния вид съдържание, което създавате.",
        },
        creator4: {
          title: "Начини за колаборация",
          description: "Изберете предпочитаните начини за сътрудничество.",
        },
        creator5: {
          title: "Аудитория",
          description:
            "Опишете аудиторията си, за да Ви свържем с подходящи брандове.",
        },
        creator6: {
          title: "Потвърждение",
          description:
            "Проверете въведените данни, преди да изпратите.",
        },
      },

      toast: {
        errorTitle: "Грешка",
        serverConnectionError: "Възникна проблем във вързката със сървръра, моля опитайте отново по-късно."
      },

      helperText: {
        followers: "Приблизителен брой последователи",
      },

      countryPick: {
        titleOwn: "Изберете Вашата държава",
        subTitleOwn: "Максимум 1 държава.",
        titleTargets: "Изберете целеви държави",
        subTitleTargets: "Максимум 3 държави.",
        save: "Запази"
      },

      validation: {
        nameEmailRequired: "Моля, въведете име и имейл",
        nicheRequired: "Моля, изберете поне една ниша",
        otherNicheRequired: "Моля, опишете другата ниша",
        categoryRequired: "Моля, изберете поне една категория",
        otherCategoryRequired: "Моля, опишете другата категория",
        countriesRequired: "Моля, изберете поне една държава",
        collabRequired: "Моля, изберете поне един вид сътрудничество",
        otherCollabRequired: "Моля, опишете другия вид колаборация",
        platformFollowersRequired: "Моля, изберете платформа и въведете последователи",
        idealClientRequired: "Моля, опишете Вашия идеален клиент",
        audienceRequired: "Моля, опишете Вашата аудитория",
        yourCountryRequired: "Моля, изберете Вашата държава"
      },

      countries: {
        "AL": "Албания",
        "AD": "Андора",
        "AT": "Австрия",
        "BY": "Беларус",
        "BE": "Белгия",
        "BA": "Босна и Херцеговина",
        "BG": "България",
        "HR": "Хърватия",
        "CY": "Кипър",
        "CZ": "Чехия",
        "DK": "Дания",
        "EE": "Естония",
        "FI": "Финландия",
        "FR": "Франция",
        "DE": "Германия",
        "GR": "Гърция",
        "HU": "Унгария",
        "IS": "Исландия",
        "IE": "Ирландия",
        "IT": "Италия",
        "XK": "Косово",
        "LV": "Латвия",
        "LI": "Лихтенщайн",
        "LT": "Литва",
        "LU": "Люксембург",
        "MT": "Малта",
        "MD": "Молдова",
        "MC": "Монако",
        "ME": "Черна гора",
        "NL": "Нидерландия",
        "NO": "Норвегия",
        "PL": "Полша",
        "PT": "Португалия",
        "RO": "Румъния",
        "RU": "Русия",
        "SM": "Сан Марино",
        "RS": "Сърбия",
        "SK": "Словакия",
        "SI": "Словения",
        "ES": "Испания",
        "SE": "Швеция",
        "CH": "Швейцария",
        "TR": "Турция",
        "UA": "Украйна",
        "GB": "Обединено кралство",
        "VA": "Ватикан"
      },

      labels: {
        name: "Име",
        brandName: "Име на бранда",
        email: "Имейл",
        phone: "Телефон",
        category: "Категория",
        niche: "Ниша",
        contentCategory: "Категория съдържание",
        audience: "Опишете Вашата аудитория",
        client: "Опишете Вашия \"идеален\" клиент",
        description: "Описание",
        collabTypes: "Кои начини за сътрудничество предпочитате?",
        website: "Уебсайт",
        socialLinks: "Социални мрежи",
        country: "Вашата държава",
        of: "от",
        username: "Потребителско име",
        platform: "Платформа",
        followers: "Брой последователи",
        targetCountries: "Целеви държави"
      },

      placeholders: {
        name: "Въведете Вашето име",
        brandName: "Въведете името на Вашия бранд",
        email: "Въведете имейл",
        phone: "Въведете телефон",
        website: "https://example.com",
        description: "Кратко описание...",
        audience: "Предимно жени (35-50)...",
        client: "Предимно мъже (35-50)...",
        socialLink: "Въведете връзка",
        select: "Моля изберете",
        followers: "Моля посочете",
        country: "Вашата държава",
        otherNiche: "Моля опишете",
        selectCountry: "+ Изберете Вашата държава",
        selectCountries: "+ Изберете до 3 държави",
        otherCollab: "Моля опишете"
      },

      misc: {
        other: "Друго",
        add: "Добави",
      },
    },

    successModal: {
      title: "Успешно се регистрирахте!",
      description: "След одобрение ще получите имейл с повече информация.",
      button: "Вижте повече",
    },

    creatorAbout: {
      hero: {
        title: "За създатели",
        subtitle: "Свържете се с брандове, които търсят вашата аудитория, и превърнете влиянието си в реални възможности."
      },
      section_title_1: "Създадена за Вас",
      section_subtitle_1: "Станете част от бъдещето на сътрудничествата между бизнеси и създатели на съдържание.",
      card_1: {
        title: "Активирайте влиянието си и печелете!",
        description: "Свързваме Ви с правилните брандове, за да превърнете влиянието си в реална стойност."
      },
      card_2: {
        title: "Transparent Payments",
        subtitle: "Receive your money securely"
      },
      card_3: {
        subtitle: "SUPPORT",
        title: "24/7 Priority"
      },
      vip: {
        title: "Станете VIP член",
        subtitle: "Получете специални привилегии и отстъпки",
        howToTitle: "Как да станете VIP?",
        step_1: "Свалете нашето брандирано видео (ще го получите след записване)",
        step_2: "Публикувайте го в Instagram и Facebook с таг @influlink.bg",
        step_3: "Нашият екип ще прегледа и одобри акаунта Ви",
        step_4: "Получете VIP статус с 30% остъпка за първите 6 месеца",
        privilegesTitle: "VIP привилегии:",
        privilege_1: "30% остъпка за 6 месеца",
        privilege_2: "Персонален акаунт мениджър",
        privilege_3: "VIP бадж на профила",
        privilege_4: "Ранен достъп до платформата",
        button: "Получи видео"
      },
      statusSection: {
        title: "Готови да се присъедините?",
        subtitle: "Запишете се сега и станете част от революцията в инфлуенсър маркетинга.",
        button: "Проверете статуса си",
        modalFirstTitle:"Проерете статуса",
        modalFirstSubtitle:"Моля, въведете имейл за да продължите.",
        modalFirstButton:"Продължи",
        modalSecondTitle:"Статус код",
        modalSecondSubtitle:"Въведете кода, който сте получили при регистрация на",
        modalSecondButton:"Провери код",
        modalBackButton:"Промени имейл",
        modalResendButton:"Изпрати нов код",
      },
      values: {
        title: "What drives us",
        mission: {
          title: "Our Mission",
          description: "To create the best platform for connecting brands and influencers in Bulgaria, by simplifying the collaboration process and ensuring measurable results."
        },
        values: {
          title: "Our Values",
          description: "Transparency, innovation, and quality are the foundation of everything we do. We believe in true connections and long-term partnerships."
        },
        vision: {
          title: "Our Vision",
          description: "To be the leading influencer marketing platform in Bulgaria and to help businesses grow through authentic connections."
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        q1: {
          question: "Какво е InfluLink?",
          answer: "InfluLink е дигитален маркетплейс, който свързва бизнеси със създатели на съдържание с фокус върху нишово влияние и качество."
        },
        q2: {
          question: "Кога ще стартира платформата?",
          answer: "Очаквайте старта в началото на 2026. Запишете се в списъка с чакащи за ранен достъп."
        },
        q3: {
          question: "Как работи специалният акаунт?",
          answer: "Публикувайте нашето видео в Instagram и Facebook и получете специални предложения и отстъпки."
        },
        q4: {
          question: "Кой може да се регистрира като създател?",
          answer: "Отговор скоро..."
        },
        q5: {
          question: "“Има ли минимални изисквания за последователи?",
          answer: "Отговор скоро..."
        }
      },
    },
    brandAbout: {
      hero: {
        title: "За бизнеси",
        subtitle: "Свържете се с точните създатели. Изградете автентични кампании с реални резултати. "
      },
      section_title_1: "Създадена за Вашия бизнес",
      section_subtitle_1: "Станете част от бъдещето на сътрудничествата между бизнеси и създатели на съдържание.",
      card_1: {
        title: "Развийте бизнеса си и изградете нови партньорства.",
        description: "InfluLink свързва вашия бизнес със създатели, които отговарят на вашата аудитория, като гарантира максимална ефективност и ясно измерими резултати."
      },
      card_2: {
        title: "Прозрачни плащания",
        subtitle: "Получете парите си сигурно"
      },
      card_3: {
        subtitle: "Поддръжка",
        title: "24/7 приоритет"
      },
      card_4: {
        subtitle: "Доверие",
        title: "Достъп до проверени от нас създатели "
      },
      card_5: {
        subtitle: "Растеж",
        title: "Ясни, измерими резултати"
      },
      statusSection: {
        title: "Готови да се присъедините?",
        subtitle: "Запишете се сега и станете част от революцията в инфлуенсър маркетинга.",
        button: "Проверете статуса си",
        modalFirstTitle:"Проерете статуса",
        modalFirstSubtitle:"Моля, въведете имейл за да продължите.",
        modalFirstButton:"Продължи",
        modalSecondTitle:"Статус код",
        modalSecondSubtitle:"Въведете кода, който сте получили при регистрация на",
        modalSecondButton:"Провери код",
        modalBackButton:"Промени имейл",
        modalResendButton:"Изпрати нов код",
      },
      vip: {
        title: "Станете VIP член",
        subtitle: "Получете специални привилегии и отстъпки",
        howToTitle: "Как да станете VIP?",
        step_1: "Свалете нашето брандирано видео (ще го получите след записване)",
        step_2: "Публикувайте го в Instagram и Facebook с таг @influlink.bg",
        step_3: "Нашият екип ще прегледа и одобри акаунта Ви",
        step_4: "Получете VIP статус с 30% остъпка за първите 6 месеца",
        privilegesTitle: "VIP привилегии:",
        privilege_1: "30% остъпка за 6 месеца",
        privilege_2: "Персонален акаунт мениджър",
        privilege_3: "VIP бадж на профила",
        privilege_4: "Ранен достъп до платформата",
        button: "Получи видео"
      },
      values: {
        title: "What drives us",
        mission: {
          title: "Our Mission",
          description: "To create the best platform for connecting brands and influencers in Bulgaria, by simplifying the collaboration process and ensuring measurable results."
        },
        values: {
          title: "Our Values",
          description: "Transparency, innovation, and quality are the foundation of everything we do. We believe in true connections and long-term partnerships."
        },
        vision: {
          title: "Our Vision",
          description: "To be the leading influencer marketing platform in Bulgaria and to help businesses grow through authentic connections."
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        q1: {
          question: "Какво е InfluLink?",
          answer: "InfluLink е дигитален маркетплейс, който свързва бизнеси със създатели на съдържание с фокус върху нишово влияние и качество."
        },
        q2: {
          question: "Кога ще стартира платформата?",
          answer: "Очаквайте старта в началото на 2026. Запишете се в списъка с чакащи за ранен достъп."
        },
        q3: {
          question: "Как работи специалният акаунт?",
          answer: "Публикувайте нашето видео в Instagram и Facebook и получете специални предложения и отстъпки."
        },
        q4: {
          question: "Кой може да се регистрира като създател?",
          answer: "Отговор скоро..."
        },
        q5: {
          question: "“Има ли минимални изисквания за последователи?",
          answer: "Отговор скоро..."
        }
      },
    },
  },

  en: {
    hero: {
      title: "Join the Future of",
      highlightText: "Influencer Marketing",
      description:
        "Sign up for early access to the first Bulgarian influencer platform.",
      creatorButton: "Creator",
      brandButton: "Business",
    },

    nav: {
      home: "Home",
      contact: "Contacts",
      brandAbout: "For businesses",
      creatorAbout: "For creators"
    },

    common: {
      back: "Back",
      next: "Next",
      submit: "Submit",
      loading: "Submitting...",
    },

    about: {
      creator: {
        createdForFirstPart: "Created for",
        createdForSecondPart: "You",
      },
      brand: {
        createdForFirstPart: "Created for",
        createdForSecondPart: "Your business",
      }
    },

    form: {
      // --- START: Added English Arrays and Step Names ---
      arrays: {
        creatorNiches: [
          "Fashion",
          "Beauty",
          "Technology",
          "Travel",
          "Fitness",
          "Food",
          "Gaming",
          "Education",
          "Comedy",
          "Lifestyle",
          "Food & Drinks",
          "Family & Kids",
          "Art",
          "Photography",
          "Music & Dance",
          "Model",
          "Animals & Pets",
          "Adventure & Outdoors",
          "Entrepreneurship & Business",
          "Athlete & Sports",
          "Healthcare",
          "Actor",
          "Cars",
          "Vegan",
          "Celebrity & Public Figure",
          "Other"
        ],
        brandCategories: ["Online store", "Retail store", "Services", "Restaurant / Cafe", "Hotel / Tourism", "Website / App", "Other"],
        creatorCollabOptions: ["Product Review", "Voice Ad", "UGC Video", "Post", "Story", "Other"],
        brandCollabOptions: ["Short Video", "Review", "Unboxing", "UGC Ad", "Photo Post", "Voiceover Video", "Other"],
      },
      stepNames: {
        creator: [
          "Basic Information",
          "Category & Niche",
          "Country & Audience",
          "Collaboration Methods",
          "Platform & Followers",
          "Your audience",
        ],
        brand: [
          "Basic Information",
          "Category & Type",
          "Target Countries",
          "Sector / niche",
          "Your clients",
        ],
      },
      // --- END: Added English Arrays and Step Names ---
      titles: {
        brands: "Registration for businesses",
        creators: "Registration for creators"
      },

      toast: {
        errorTitle: "Error",
        serverConnectionError: "There was a problem with the server connection, please try again later."
      },

      stepIndicator: {
        step: "Step",
      },

      leftSide: {
        title: "Be a part of the future",
        brandsSubText: "Collaborate with the best creators in Bulgaria",
        creatorsSubText: "Collaborate with the most famous brands in the world"
      },

      helperText: {
        followers: "Approximate amount of followers",
      },


      countryPick: {
        titleOwn: "Choose your country",
        subTitleOwn: "Maximum 1 selection.",
        titleTargets: "Choose target countries",
        subTitleTargets: "Maximum 3 selections.",
        save: "Submit"
      },

      validation: {
        nameEmailRequired: "Please enter a name and email",
        nicheRequired: "Please select at least one niche",
        otherNicheRequired: "Please describe the other niche",
        categoryRequired: "Please select at least one category",
        otherCategoryRequired: "Please describe the other category",
        countriesRequired: "Please select at least one country",
        collabRequired: "Please select at least one collaboration type",
        otherCollabRequired: "Please describe the other collaboration type",
        platformFollowersRequired: "Please select a platform and enter followers",
        idealClientRequired: "Please describe your ideal client",
        audienceRequired: "Please describe your audience",
        yourCountryRequired: "Please, select your country"
      },

      countries: {
        "AL": "Albania",
        "AD": "Andorra",
        "AT": "Austria",
        "BY": "Belarus",
        "BE": "Belgium",
        "BA": "Bosnia and Herzegovina",
        "BG": "Bulgaria",
        "HR": "Croatia",
        "CY": "Cyprus",
        "CZ": "Czechia",
        "DK": "Denmark",
        "EE": "Estonia",
        "FI": "Finland",
        "FR": "France",
        "DE": "Germany",
        "GR": "Greece",
        "HU": "Hungary",
        "IS": "Iceland",
        "IE": "Ireland",
        "IT": "Italy",
        "XK": "Kosovo",
        "LV": "Latvia",
        "LI": "Liechtenstein",
        "LT": "Lithuania",
        "LU": "Luxembourg",
        "MT": "Malta",
        "MD": "Moldova",
        "MC": "Monaco",
        "ME": "Montenegro",
        "NL": "Netherlands",
        "NO": "Norway",
        "PL": "Poland",
        "PT": "Portugal",
        "RO": "Romania",
        "RU": "Russia",
        "SM": "San Marino",
        "RS": "Serbia",
        "SK": "Slovakia",
        "SI": "Slovenia",
        "ES": "Spain",
        "SE": "Sweden",
        "CH": "Switzerland",
        "TR": "Turkey",
        "UA": "Ukraine",
        "GB": "United Kingdom",
        "VA": "Vatican City"
      },

      steps: {
        1: {
          title: "Basic Information",
          description:
            "Fill in your details so we can set up your InfluAi profile.",
        },
        2: {
          title: "What type of business are you?",
          description: "Select the area in which your brand operates.",
        },
        3: {
          title: "Collaboration Types",
          description: "Choose how you want to work with creators.",
        },
        4: {
          title: "Within which niche do you operate?",
          description:
            "Help us connect you with the most relevant creators.",
          helperText:
            "We use this information to match you with the right creators.",
        },
        5: {
          title: "Confirmation",
          description: "Review your details before submitting.",
        },

        // Creator steps
        creator2: {
          title: "Category & Niche",
          description:
            "Select the niche that best describes your content.",
        },
        creator3: {
          title: "Content Genre",
          description: "Choose the main type of content you create.",
        },
        creator4: {
          title: "Collaboration Methods",
          description: "Select your preferred collaboration types.",
        },
        creator5: {
          title: "Audience",
          description:
            "Describe your audience so we can match you with the right brands.",
        },
        creator6: {
          title: "Confirmation",
          description: "Check your details before submitting.",
        },
      },

      labels: {
        name: "Name",
        brandName: "Brand name",
        email: "Email",
        phone: "Phone",
        category: "Category",
        niche: "Niche",
        contentCategory: "Content category",
        audience: "Describe your audience",
        client:"Describe your \"ideal\" client",
        description: "Description",
        collabTypes: "Collaboration types",
        website: "Website",
        socialLinks: "Social links",
        country: "Country",
        of: "of",
        select: "Please choose",
        username: "Username",
        platform: "Platform",
        followers: "Followers",
        targetCountries: "Target countries"
      },

      placeholders: {
        name: "Enter your name",
        brandName: "Enter your brand name",
        email: "Enter your email",
        phone: "Enter your phone number",
        website: "https://example.com",
        description: "Short description...",
        audience: "Mostly women (35-50)...",
        socialLink: "Enter a link",
        country: "Your country",
        selectCountry: "+ Choose your country",
        selectCountries: "+ Choose up to 3 countries",
        followers: "Please enter",
        select: "Please choose",
        otherNiche: "Please enter",
        otherCollab: "Please enter",
        otherCategory: "Please enter the type of business.."
      },

      misc: {
        other: "Other",
        add: "Add",
      },
    },

    successModal: {
      title: "Registration Successful!",
      description:
        "After approval, you will receive an email with more information.",
      button: "Learn more",
    },

    creatorAbout: {
      hero: {
        title: "For Creators",
        subtitle: "The first platform in Bulgaria connecting brands with influencers for genuine and measurable growth"
      },
      section_title_1: "Built for You",
      section_subtitle_1: "Become part of the future of collaborations between businesses and content creators.",
      card_1: {
        title: "Activate your influence and earn!",
        description: "We connect you with the right brands, so that you can turn your influence into real value."
      },
      card_2: {
        title: "Transparent Payments",
        subtitle: "Receive your money securely"
      },
      card_3: {
        subtitle: "Support",
        title: "24/7 Priority"
      },
      card_4: {
        subtitle: "Trust",
        title: "Create real partnernships"
      },
      card_5: {
        subtitle: "Perspective",
        title: "Global access to possibilities"
      },
      displayCards: {
        title: "Begin your career now!",
        coloredTitle: "Connect with the right creators immediately.",
        subtitle: "Quit waiting. Earn from your content.",
        description: "Focus on creating content, we'll handle the collaborations and payments.",
      },
      statusSection: {
        title: "Ready to join?",
        subtitle: "Sign up now and become a part of the revolution of influencer marketing.",
        button: "Check your status",
        modalFirstTitle:"Check your status",
        modalFirstSubtitle:"Please, enter your email address to continue.",
        modalFirstButton:"Continue",
        modalSecondTitle:"Status code",
        modalSecondSubtitle:"Enter the code you received upon registration on",
        modalSecondButton:"Submit code",
        modalBackButton:"Change email",
        modalResendButton:"Resend code",
      },
      vip: {
        title: "Become a VIP Member",
        subtitle: "Get special privileges and discounts",
        howToTitle: "How to become VIP?",
        step_1: "Download our branded video (you will receive it after signing up)",
        step_2: "Publish it on Instagram and Facebook story with tag @influlink.bg",
        step_3: "Our team will review and approve your account",
        step_4: "Get VIP status with 30% discount for the first 6 months",
        privilegesTitle: "VIP Privileges:",
        privilege_1: "30% discount for 6 months",
        privilege_2: "Personal account manager",
        privilege_3: "VIP badge on the profile",
        privilege_4: "Early acccess to the platform",
        button: "Get Video"
      },
      values: {
        title: "What drives us",
        mission: {
          title: "Our Mission",
          description: "To create the best platform for connecting brands and influencers in Bulgaria, by simplifying the collaboration process and ensuring measurable results."
        },
        values: {
          title: "Our Values",
          description: "Transparency, innovation, and quality are the foundation of everything we do. We believe in true connections and long-term partnerships."
        },
        vision: {
          title: "Our Vision",
          description: "To be the leading influencer marketing platform in Bulgaria and to help businesses grow through authentic connections."
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        q1: {
          question: "What is InfluLink?",
          answer: "The first platform in Bulgaria that connects brands with influencers for authentic campaigns."
        },
        q2: {
          question: "When will the platform launch?",
          answer: "Expect the launch in early 2026. Sign up for the waiting list for early access."
        },
        q3: {
          question: "How does the special account work?",
          answer: "Post our video in your Instagram story and receive a discount upon approval."
        },
        q4: {
          question: "Is there a registration fee?",
          answer: "Registration is free. Fees are only applied for active campaigns."
        }
      },
      toasts: {
        success_title: "Form submitted successfully!",
        success_description: "You will receive a confirmation email.",
        error_send_title: "Error while sending",
        error_send_description: "Please try again later.",
        error_network_title: "An error occurred",
        error_network_description: "Check your internet connection and try again.",
        quiz_success_title: "Successfully signed up!",
        quiz_success_description: "We will contact you soon."
      }
    },

    brandAbout: {
      hero: {
        title: "For Businesses",
        subtitle: "Connect with the right creators. Create authentic campaigns with measurable growth. "
      },
      section_title_1: "Created for your business",
      section_subtitle_1: "Станете част от бъдещето на сътрудничествата между бизнеси и създатели на съдържание.",
      card_1: {
        title: "Развийте бизнеса си и изградете нови партньорства.",
        description: "InfluLink свързва вашия бизнес със създатели, които отговарят на вашата аудитория, като гарантира максимална ефективност и ясно измерими резултати."
      },
      card_2: {
        title: "Transparent payments",
        subtitle: "Get your money safely"
      },
      card_3: {
        subtitle: "Support",
        title: "24/7 priority"
      },
      card_4: {
        subtitle: "Trust",
        title: "Acess to verified creators "
      },
      card_5: {
        subtitle: "Growth",
        title: "Clear, measurable results"
      },
      displayCards: {
        title: "Save time.",
        coloredTitle: "Connect with the right creators immediately.",
        subtitle: "Manage your campaigns effectively, with ease.",
        description: "Find the right creators, create campaigns and manage payments in one transparent process.",
      },
      statusSection: {
        title: "Ready to join?",
        subtitle: "Sign up now and become a part of the revolution of influencer marketing.",
        button: "Check your status",
        modalFirstTitle:"Check your status",
        modalFirstSubtitle:"Please, enter your email address to continue.",
        modalFirstButton:"Continue",
        modalSecondTitle:"Status code",
        modalSecondSubtitle:"Enter the code you received upon registration on",
        modalSecondButton:"Submit code",
        modalBackButton:"Change email",
        modalResendButton:"Resend code",
      },
      vip: {
        title: "Become a VIP Member",
        subtitle: "Get special privileges and discounts",
        howToTitle: "How to become VIP?",
        step_1: "Download our branded video (you will receive it after signing up)",
        step_2: "Publish it on Instagram and Facebook story with tag @influlink.bg",
        step_3: "Our team will review and approve your account",
        step_4: "Get VIP status with 30% discount for the first 6 months",
        privilegesTitle: "VIP Privileges:",
        privilege_1: "30% discount for 6 months",
        privilege_2: "Personal account manager",
        privilege_3: "VIP badge on the profile",
        privilege_4: "Early acccess to the platform",
        button: "Get Video"
      },
      values: {
        title: "What drives us",
        mission: {
          title: "Our Mission",
          description: "To create the best platform for connecting brands and influencers in Bulgaria, by simplifying the collaboration process and ensuring measurable results."
        },
        values: {
          title: "Our Values",
          description: "Transparency, innovation, and quality are the foundation of everything we do. We believe in true connections and long-term partnerships."
        },
        vision: {
          title: "Our Vision",
          description: "To be the leading influencer marketing platform in Bulgaria and to help businesses grow through authentic connections."
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        q1: {
          question: "Какво е InfluLink?",
          answer: "InfluLink е дигитален маркетплейс, който свързва бизнеси със създатели на съдържание с фокус върху нишово влияние и качество."
        },
        q2: {
          question: "Кога ще стартира платформата?",
          answer: "Очаквайте старта в началото на 2026. Запишете се в списъка с чакащи за ранен достъп."
        },
        q3: {
          question: "Как работи специалният акаунт?",
          answer: "Публикувайте нашето видео в Instagram и Facebook и получете специални предложения и отстъпки."
        },
        q4: {
          question: "Кой може да се регистрира като създател?",
          answer: "Отговор скоро..."
        },
        q5: {
          question: "“Има ли минимални изисквания за последователи?",
          answer: "Отговор скоро..."
        }
      },
    },
  }
};

export type Language = "bg" | "en";