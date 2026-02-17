import { register } from "module";

export const translations = {
  bg: {
    hero: {
      title: "Глобален обхват",
      highlightText: "Локално въздействие",
      description:
        "Запишете се за ранен достъп и бъдете сред първите.",
      creatorButton: "Създател",
      brandButton: "Бизнес",
      mainCta: "Открийте създатели",
      secondaryCta: ""
    },

    nav: {
      home: "Начало",
      contact: "Контакти",
      brandAbout: "За бизнеси",
      creatorAbout: "За създатели",
      register: "Регистрирай се",
      profile: "Профил"
    },

    legal: {
      title: "Правна информация",
      privacyPolicy: "Политика за поверителност",
      terms: "Условия за ползване",
      cookies: "Бисквитки"
    },

    cookies: {
      banner: {
        title: "Управление на бисквитките",
        description: "Използваме бисквитки за подобряване на функционалността, персонализиране на съдържанието и анализ на трафика ни. Можете да промените настройките си по всяко време."
      },
      buttons: {
        settings: "Настройки",
        acceptAll: "Приемам всички",
        declineAll: "Отказвам незадължителните",
        saveChoice: "Запази моите предпочитания"
      },
      settings: {
        title: "Вашите предпочитания за поверителност",
        description: "Прегледайте и разрешете категориите бисквитки, които искате да използваме."
      },
      misc: {
        essentialTag: "Задължителни"
      },
      categories: {
        essential: {
          name: "Необходими бисквитки",
          description: "Тези бисквитки са важни за функционирането на сайта (напр. вход в профила, сигурност). Те не събират лична информация и не могат да бъдат изключени."
        },
        analytics: {
          name: "Анализ и статистика",
          description: "Помагат ни да разберем как използвате сайта, кои страници са най-популярни и къде има технически грешки, за да можем да подобрим платформата."
        },
        marketing: {
          name: "Маркетинг и реклама",
          description: "Използват се за проследяване на вашите интереси и показване на по-релевантни реклами в други платформи (като Facebook или Google)."
        }
      }
    },

    contacts: {
      title: "Свържете се с нас",
      subtitle: "Имате въпроси? Нашият екип е на разположение 24/7, за да ви помогне",
      email: "Имейл",
      location: "Локация",
      locationValue: "България",
      workHours: "Работно време",
      workHoursValue: "Поддръжка 24/7",
      sendMessage: "Изпратете ни съобщение",
      name: "Име",
      namePlaceholder: "Вашето име",
      subject: "Тема",
      subjectPlaceholder: "Относно какво е Вашето съобщение?",
      message: "Съобщение",
      messagePlaceholder: "Вашето съобщение...",
      button: "Изпрати"
    },

    drivesUs: {
      title: "Какво ни движи",
      card1Title: "Нашата мисия",
      card1Content: "Да улесним сътрудничеството между бизнеси и създатели на съдържание чрез прозрачна, ефективна и ориентирана към качество платформа, която създава реална стойност и измерими резултати.",
      card2Title: "Нашите ценности",
      card2Content: "Качество, прозрачност и автентичност.Вярваме в силата на нишовото влияние и устойчивите партньорства.",
      card3Title: "Нашата визия",
      card3Content: "Да зададем нов стандарт в инфлуенсър маркетинга чрез качество, доверие и устойчив растеж."
    },

    footer: {
      slogan: "Глобален обхват. Локално въздействие.",
      rights: "Всички права запазени",
      nav: {
        title: "Навигация",
        home: "Начало",
        contact: "Контакти",
        about: "За нас"
      },
      support: "24/7 Поддръжка",
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

    editProfile: {
      title: "Редактиране на профил",
      subtitle: "Изберете промени"
    },

    mvpHero: {
      titleFirst: "Където",
      titleSecond: "Брандове",
      titleThird: "Срещат",
      titleFourth: "Създатели",
      subtext: "Най-добрата платформа за инфлуенсър маркетинг. Намерете идеалния партньор и растете заедно.",
      secondaryButton: "Разгледай функциите",
      primaryButton: "Присъедини се",
    },

    mvpTerms: {
      heroTitle: "Условия за",
      heroTitleSpan: "ползване",
      heroSubtitle: "Правната рамка за професионални сътрудничества в InfluLink.",
      userAgreementTitle: "Потребителско споразумение и правила",
      lastUpdated: "Последна актуализация: Януари 2026 г.",
      roleTitle: "Роля на платформата",
      roleContent: "InfluLink действа като посредник между брандове и създатели. Ние улесняваме връзката, но не сме страна по индивидуалните договори за кампании.",
      integrityTitle: "Почтеност на профила",
      integrityContent: "Потребителите трябва да поддържат автентични метрики. Използването на ботове, фалшиви последователи или измамна ангажираност е строго забранено.",
      paymentsTitle: "Плащания и такси",
      paymentsContent: "Таксите на платформата и условията за обработка на плащания се прилагат за успешни сътрудничества съгласно вашия план или договор.",
      s1Title: "1. Услугата",
      s1Content: "InfluLink предоставя платформа за създатели, които да покажат своето портфолио, и за брандове, които да откриват и управляват маркетингови кампании. Създавайки акаунт, вие се съгласявате да спазвате тези условия и законите на Република България.",
      s2Title: "2. Собственост върху съдържанието",
      s2Content: "Създателите запазват правата върху оригиналното си съдържание. Въпреки това, чрез участие в кампания, създателите предоставят на брандовете ограничен, неизключителен лиценз за използване на съдържанието, както е посочено в описанието на кампанията.",
      s3Title: "3. Професионално поведение",
      s3Content: "Потребителите се съгласяват да действат добросъвестно. Брандовете трябва да предоставят ясни насоки; създателите трябва да спазват крайните срокове и да поддържат прозрачност (използвайки #ad или еквиваленти).",
      s4Title: "4. Ограничаване на отговорността",
      s4Content: "ИНФЛУЛИНК ЕООД не носи отговорност за качеството или безопасността на услугите, предоставени от създателите, нито за точността на кампаниите от брандовете.",
      s5Title: "5. Разрешаване на спорове",
      s5Content: "Всички договорни спорове относно плащания или изпълнение трябва да се решават директно между бранда и създателя. Тези условия се уреждат от българското законодателство.",
      s6Title: "6. Авторско право (DMCA)",
      s6Content: "InfluLink уважава правата върху интелектуалната собственост и реагира на сигнали за нарушения съгласно Директивата на ЕС за авторското право.",
      s6Notice: "За да подадете сигнал, моля предоставете:",
      s6List1: "Идентификация на защитеното произведение.",
      s6List2: "Специфичен URL адрес в InfluLink.",
      s6List3: "Вашият имейл и декларация за добросъвестност.",
      s7Title: "7. Плащания и комисионни",
      s7Content: "InfluLink може да начислява такси за обслужване. Финансовите транзакции се обработват чрез оторизирани доставчици (напр. Stripe). Потребителите сами носят отговорност за своите данъчни задължения."
    },

    addPost: {
      processImage: "Обработка на изображението...",
      upTo: "до",
      uploadImage: "Качете изображение",
      continue: "Продължи",
      campaignTitle: "Заглавие на кампанията",
      back: "Назад",
      next: "Напред",
      brandType: "Тип на бранда",
      selectType: "Изберете тип...",
      reel: "reel",
      video: "видео",
      post: "публикация",
      blogArticle: "Блог статия",
      desc: "Описание",
      publish: "Публикувайте",
      publishing: "Публикуване...",
      addNewWork: "Добавете нова работа",
      showcase: "Покажете най-добрите си сътрудничества на брандовете.",
      campaignImage: "Изображение на кампанията",
      campTitle: "Заглавие на кампанията",
      brandName: "Име на бранда",
      contentType: "Тип съдържание",
      cancel: "Отказ",
      content: "Съдържание"
    },

    mvpCampaignHistory: {
      title: "История на кампании",
      searchCampaigns: "Търсете кампания...",
      campaign: "Кампания",
      status: "Статус",
      brand: "Бранд",
      reach: "Обхват",
      engagement: "Ангажираност",
      earnings: "Приходи",
      desc: "Описание",
      back: "Назад",
      certifiedMetrics: "Потвърдени данни",
      performanceSince: "Представяне от",
      engagementRate: "Ангажираност",
      trafficInsights: "Данни за трафика",
      reportGenerated: "Генериран отчет",
      downloadPDF: "Свалете PDF",
      data: "Данни",
      viewAnalytics: "Вижте аналитики",
      impressions: "Импресии",
      completed: "Завършен",
      inProgress: "В процес",
      pending: "Изчакващ"
    },

    mvpSearchSection: {
      titleFirst: "Намерете своя",
      titleSecond: "Идеален създател",
      subTitle: "Търсете сред хиляди проверени създатели и открийте идеалния партньор за вашия бранд",
      niche: "Ниша/Категория",
      platform: "Платформа",
      followersRange: "Брой последователи",
      followersRangePlaceholder: "Изберете брой",
      country: "Държава",
      selectCountry: "Изберете държава",
      language: "Език",
      engagementRate: "Ангажираност",
      vipOnly: "Само VIP създатели",
      searchButton: "Намери създател",
      resetButton: "Изчисти",
      simpleSearch: "Прости филтри",
      advancedSearch: "Разширени филтри",
    },

    mvpProfileTabs: {
      portfolio: "Портфолио",
      campaigns: "Кампании",
      addWork: "Нов проект",
      yourCampaigns: "Вашите кампании",
      noPortfolioItems: "Все още няма прокети в това портфолио.",
      manageCampaigns: "Управлявайте и следете прогреса на кампаниите си"
    },

    mvpCampaignSearchSection: {
      titleFirst: "Намерете",
      titleSecond: "кампании",
      subTitle: "Browse active brand campaigns and apply to the ones that fit you best",
      niche: "Ниша/Категория",
      platform: "Платформа",
      country: "Държава",
      selectCountry: "Изберете държава",
      language: "Език",
      maxBudget: "Максимален бюджет",
      searchButton: "Намерете кампания",
      resetButton: "Изчисти",
      simpleSearch: "Прости филтри",
      advancedSearch: "Разширени филтри",
      contentType: "Тип съдържание",
      urgentOnly: "Само спешни кампании",
      urgentText: "Кампании с висок приоритет"
    },


    privacy: {
      heroTitle: "Правна информация и поверителност",
      heroSubtitle: "Прозрачност и сигурност на данните за екосистемата на InfluLink.",
      disclosureTitle: "Правно оповестяване (Импресум)",
      companyName: "Име на компанията",
      registeredOffice: "Седалище и адрес на управление",
      email: "Имейл",
      companyId: "ЕИК",
      availableSoon: "208542977",
      detailedPolicyTitle: "Подробна политика за поверителност",
      policyIntro: "Тази политика описва нашите практики относно събирането и използването на лични данни в рамките на платформата InfluLink. Ние действаме като Администратор на данни съгласно Общия регламент относно защитата на данните (GDPR).",
      basisTitle: "Правно основание за обработка",
      basisIntro: "Ние обработваме Вашите данни въз основа на следните правни основания:",
      basisContract: "Договорна необходимост: За предоставяне на услугите на платформата и управление на Вашия профил.",
      basisLegal: "Законово задължение: За данъчни и счетоводни цели съгласно българското законодателство.",
      basisInterest: "Легитимен интерес: За подобряване на сигурността на платформата и предотвратяване на измамни дейности.",
      sharingTitle: "Споделяне на данни",
      sharingContent: "Като платформа за сътрудничество, специфични данни от профила (потребителски имена, метрики, ниши) са видими за регистрирани брандове с цел улесняване на партньорствата. Ние не продаваме Вашата лична информация за контакт на трети страни.",
      transferTitle: "Международен трансфер на данни",
      transferContent: "Въпреки че сме базирани в България, някои доставчици на услуги (като платежни оператори или облачна инфраструктура) могат да обработват данни извън ЕИП. Ние гарантираме, че тези доставчици спазват Стандартните договорни клаузи (SCC).",
      rightsTitle: "Вашите права",
      rightsIntro: "Съгласно GDPR имате следните права:",
      right1: "Право на достъп и преносимост на данните.",
      right2: "Право на коригиране на данните в профила.",
      right3: "Право на изтриване („Право да бъдеш забравен“).",
      right4: "Право на възражение срещу директен маркетинг.",
      cards: {
        controllerTitle: "1. Администратор на данни",
        controllerContent: "ИНФЛУЛИНК ЕООД, компания, регистрирана в България. Основното ни съхранение на данни се намира на защитени сървъри в ЕС, напълно съобразени с разпоредбите на GDPR.",
        dataTitle: "2. Данни, които обработваме",
        dataContent: "Обработваме самоличността на профила, професионални метрики за инфлуенсъри, данни за кампании и история на транзакциите, необходими за улесняване на партньорствата.",
        securityTitle: "3. Сигурност и съхранение",
        securityContent: "Вашите данни са защитени чрез криптиране. Запазваме данни, докато профилът Ви е активен или според изискванията на българските данъчни и търговски закони."
      }
    },

    links: {
      title: "Активни връзки",
      subtitle: "Създатели, с които сте в активни кампании",
      chat: "Чат",
      noActive: "Не бяха открити създатели, с които работите",
      searchBy: "Търсете по име или @таг..."
    },

    deleteCampaign: {
      title: "Изтриване на кампанията?",
      sureToDelete: "Сигурни ли сте, че искате да изтриете ",
      warning: "Това действие е необратимо. Всички данни за кампанията, аналитики и медия ще бъдат изттрити.",
      cancel: "Отказ",
      deleteButton: "Изтрий"
    },

    chat: {
      typeMessage: "Напишете съобщение...",
      online: "Онлайн",
      offline: "Офлайн"
    },

    dock: {
      campaigns: "Кампании",
      newCampaign: "Нова кампания",
      chat: "Чат",
      links: "Връзки"
    },

    joinDialog: {
      findCampaigns: "Открийте кампании",
      setYourRates: "Настройте цените си",
      getPaidDirectly: "Получете парите си директно",
      postCampaigns: "Качвайте кампании",
      findCreators: "Открийте създателии",
      trackPerformance: "Следете прогреса",
      title: "Станете част от Influlink",
      selectTypeToStart: "Изберете тип акаунт за да започнете",
      signIn: "Влезте",
      getStarted: "Започнете сега",
      alreadyAccount: "Вече имате акаунт?",
      creatorDesc: "Създавайте съдържание и се развийте като създател",
      brandDesc: "Открийте създатели и управлявайте успешни кампании"
    },

    mvpLogin: {
      becomeCreator: "Станете Създател",
      welcomeBack: "Добре дошли обратно!",
      letsSecureFirst: "Нека първо да защитим акаунта Ви",
      yourIdentity: "Вашата самоличност",
      fullName: "Име",
      countryCity: "Държава / Град",
      back: "Назад",
      nextStep: "Следваща стъпка",
      yourNiche: "Вашата ниша",
      shortBio: "Кратка биография",
      almostThere: "Почти приключихме",
      name: "Име",
      handle: "Таг",
      niche: "Ниша",
      iAgreeToThe: "Съгласявам се с",
      termsOfService: "Условия за ползване",
      privacy: "Политика за личните данни",
      creatingAccount: "Създайте акаунт",
      confirmAndEnter: "Потвърдете и влезте",
      backToDetails: "Обратно към детайли",
      quitWaiting: "Спрете да чакате",
      startGrowing: "Започнете да растете",
      companyName: "Име на компанията",
      email: "Имейл",
      password: "Парола",
      registering: "Регистриране...",
      logging: "Влизане...",
      or: "Или",
      signWithGoogle: "Влезте с Google",
      alreadyAccount: "Вече имате акаунт? ",
      noAccount: "Нямате акаунт? ",
      login: "Влезте",
      register: "Регистрирайте се",
      registrationSuccess: "Registration successfull",
      accountCreatedSuccess: "Your account has been created successfully!",
      continue: "Продължете",
      signUp: "Регистрация",
      logIn: "Влизане",
      reviewSummary: "Преглед на данните",
      and: "и",
      acknowledgeUse: "Потвърждавам използването на задължителни бисквитки (cookies) за сигурността на акаунта."
    },

    mvpRegisterBrand: {
      launchYourBrand: "Стартирайте Вашия бранд",
      welcomeBack: "Добре дошли отново!",
      setupBusinessAcc: "Нека настроим Вашия бизнес профил",
      businessIdentity: "Бизнес идентичност",
      benefit1: "Името на вашия бранд и местоположението на централата ни помагат да ви свържем със създатели, които отговарят на вашите регионални пазарни цели.",
      companyName: "Име на компанията",
      brandUsername: "Потребителско име",
      headquarters: "Централа",
      cityCountry: "Град, държава",
      nextStep: "Следваща стъпка",
      industryFocus: "Фокус върху индустрията",
      benefit2: "Изборът на индустрия позволява на нашия алгоритъм да препоръчва създатели с доказан опит във Вашия специфичен пазарен сегмент.",
      primaryIndustry: "Основна индустрия",
      selectYourIndustry: "Изберете вашата индустрия",
      companyBioMission: "Биография / Мисия на компанията",
      tellCreatorsWhatStand: "Разкажете на създателите в какво вярвате",
      back: "Назад",
      finalize: "Финализиране",
      businessSummary: "Резюме на бизнеса",
      brand: "Бранд",
      industry: "Индустрия",
      creatingBrandProfile: "Създаване на профил на бранда...",
      confirmLaunch: "Потвърждаване и стартиране",
      backDetails: "Обратно към детайлите",
      buildYour: "Изградете наследството",
      brandLegacy: "на бранда си",
      brandAdvantage:"Предимство",
      partnerWithPros:"Работете с професионалисти",
      crossBridgeBetween: "Свържете своя бранд със световноизвестни създатели.",
      benefit3: "Присъединявайки се, вие отключвате възможността да публикувате кампании и да използвате нашите автоматизирани инструменти за договори със създатели."
    },

    mvpCookies: {
      heroTitle: "Политика за",
      heroTitleSpan: "бисквитки",
      heroSubtitle: "Прозрачност относно това как използваме технологии за проследяване, за да осигурим работата на InfluLink.",
      sec1Title: "1. Какво са бисквитките?",
      sec1Content: "Бисквитките са малки текстови файлове, поставени на вашето устройство от уебсайтовете, които посещавате. Те се използват широко за по-ефективна работа на сайтовете, както и за предоставяне на информация на собствениците им. В InfluLink използваме бисквитки, за да ви държим вписани, да помним предпочитанията ви и да анализираме трафика си.",
      sec2Title: "2. Категории бисквитки, които използваме",
      durationTitle: "Продължителност",
      sessionTitle: "Сесийни бисквитки:",
      sessionContent: "Изтриват се автоматично, когато затворите браузъра си.",
      persistentTitle: "Постоянни бисквитки:",
      persistentContent: "Остават на вашето устройство за определен период (обикновено от 30 дни до 1 година) или докато не бъдат изтрити ръчно.",
      thirdPartyTitle: "Бисквитки на трети страни",
      thirdPartyContent: "Някои бисквитки се поставят от услуги на трети страни, които се показват на нашите страници (като Google или Stripe). Ние не контролираме тези бисквитки директно.",
      sec3Title: "3. Управление на вашите предпочитания",
      sec3Content: "Имате право да решите дали да приемете или отхвърлите несъществени бисквитки. Можете да настроите браузъра си да приема или отказва бисквитки. Ако изберете да отхвърлите бисквитките, пак можете да използвате нашия уебсайт, въпреки че достъпът до някои функции може да бъде ограничен.",
      openSettings: "Отвори панела за настройки на бисквитки",
      lastUpdated: "Последна актуализация: януари 2026 г. • INFLULINK LTD. (България)",
      catStrictTitle: "Строго необходими бисквитки",
      catStrictDesc: "Те са от съществено значение за сърфирането в уебсайта и използването на неговите функции, като достъп до защитени зони (Вход) и поддържане на вашата сесия. Платформата не може да функционира без тях.",
      catStrictStatus: "Винаги активни",
      catPerfTitle: "Производителност и анализи",
      catPerfDesc: "Използваме ги, за да разберем как посетителите взаимодействат с InfluLink. Те ни помагат да разберем кои страници са най-популярни и къде може да има технически грешки. Всички данни са обобщени и анонимни.",
      catPerfStatus: "Опционални",
      catFuncTitle: "Функционални бисквитки",
      catFuncDesc: "Те позволяват на уебсайта да помни изборите, които правите (като предпочитан език или регион), за да осигурят по-персонализирано преживяване.",
      catFuncStatus: "Опционални"
    },

    mvpCreateCampaign: {
      name: "Име на кампанията",
      desc: "Описание",
      type: "Тип",
      emailCampaign: "Имейл кампания",
      socialMedia: "Социални мрежи",
      paidAds: "Платена реклама",
      contentMarketing: "Маркетинг на съдържание",
      startDate: "Начална дата",
      primaryGoal: "Основна цел",
      reach: "Обхват",
      conversions: "Конверсии",
      engagement: "Ангажираност",
      brandAwareness: "Познаване на бранда",
      totalBudget: "Общ бюджет",
      platforms: "Платформи",
      niches: "Ниши",
      audienceContent: "",
      contentTypes: "Тип съдържание",
      targetCountry: "Целева държава",
      selectCountry: "Изберете държава",
      languages: "Езици",
      companyLogo: "Лого",
      optional: "По желание",
      refImages: "Референтни сниимки",
      step: "Стъпка",
      of: "от",
      back: "Назад",
      nextStep: "Следваща стъпка",
      selectType: "Изберете тип",
      describe: "Опишете вашата основна цел и целева аудитория...",
      step1Title: "Основни детайли",
      step1Desc: "Дефинирайте фундаменталните аспекти на вашата кампания",
      step2Title: "Цели и бюджет",
      step2Desc: "Посочете своите цели и разпределете необходимите средства",
      step3Title: "Таргетиране и филтри",
      step3Desc: "Изберете платформи, ниши и обхват на аудиторията",
      step4Title: "Медия и брандинг",
      step4Desc: "Качете лого и креативни референции",
      platformsNiches: "Платформи & Ниши",
      createButton: "Създайте кампания",
      tooltip: "Качете изображения, за да помогнете на създателите да разберат стила на бранда Ви.",
      post: "Пост",
      video: "Видео",
      story: "Стори",
      reel: "Рийл",
      livestream: "На живо",
      english: "Английски",
      german: "Немски",
      french: "Френски",
      spanish: "Испански",
      bulgarian: "Български",
    },

    mvpAnalytics: {
      title: "Аналитики",
      noData: "Все още няма данни.",
      totalViews: "Брой гледания",
      thisMonth: "този месец",
      totalLikes: "Брой харесвания",
      avgEngagement: "Ср. ангажираност",
      newFollowers: "Нови последователи",
      engRateTrend: "Тенденция на ангажираността",
      viewsByPlatform: "Гледания по устройства",
      reachTrend: "Обхват",
      topPerformingContent: "Най-успешно съдържание",
      dataNotAvailableYet: "Все още няма данни.",
      deviceWeb: "Декстоп",
      deviceMobile: "Мобилен",
      requestVIP: "Вземете VIP достъп",
      unlockInsights: "Отключете детайлни анализи за ангажираността на вашата аудитория, тенденциите в обхвата и показателите за ефективност."
    },

    mvpNotifications: {
      title: "Известия",
      proposalAccepted: "Предложението е прието!",
      proposalDeclined: "Предложението е отказано",
      campaignInvitation: "Покана за кампания",
      proposalReceived: "Ново предложение",
      inviteAccepted: "Поканата е приета!",
      markAll: "Маркирай всички като прочетени",
      daysAgo: "преди дни",
      proposalDetails: "Детайли на предложението",
      message: "Съобщение",
      proposedPrice: "Предложена цена",
      status: "Статус",
      loadingNotifications: "Зареждане на известия...",
      clickToViewPortfolio: "Натиснете за портфолиото",
      creator: "Създател",
      brand: "Бранд",
      price: "Цена",
      type: "Тип",
      received: "Получено",
      relatedTo: "Свързано с",
      proposalReceivedMsg: "Създател има предложение за ваша кампания.",
      proposalAcceptedMsg: "Вашето предложение беше прието. Пригответе се за съвместна работа!",
      proposalRejectedMsg: "За съжаление, вашето предложение не беше избрано този път.",
      campaignInviteMsg: "Получихте покана да се присъедините към нова кампания!",
      inviteAcceptedMsg: "Създател прие ваша покана за участие в кампания.",
      inviteDeclinedMsg: "Създател отказа ваша покана за участие в кампания.",
      typeProposal: "Предложение",
      typeInvite: "Покана",
      typeMessage: "Съобщение"
    },

    mvpCampaignDetails: {
      title: "Детайли на кампанията",
      startDate: "Начална дата",
      desc: "Описание",
      edit: "Редактирай",
      delete: "Изтрий",
      media: "Медия",
      overview: "Общ преглед",
      analytics: "Аналитики",
      primaryGoal: "Основна цел",
      platforms: "Платформи",
      niches: "Ниши",
      contentTypes: "Видове съдържание",
      country: "Държава",
      languages: "Езици",
      budget: "Бюджет",
      totalBudget: "Общ бюджет",
      budgetTracker: "Проследяване на бюджета",
      budgetSpent: "Използван бюджет",
      of: "от",
      spent: "Изразходвани",
      remaining: "Оставащи",
      impressions: "Импресии",
      reach: "Достигане",
      companyLogo: "Лого на компанията",
      noLogo: "Няма лого",
      referenceImages: "Референтни изображения",
    },

    mvpFeaturesSection: {
      firstTitle: "Лесно откриване и напасване",
      firstSubtitle: "Намерете идеалните създатели за вашия бранд с нашата интелигентна система за съответствие.",
      firstBenefit1: "Разширени филтри за търсене за стесняване на избора до идеалните създатели",
      firstBenefit2: "AI-базирано напасване според демографските данни на аудиторията",
      firstBenefit3: "Проверени профили на криейтъри с автентични метрики за ангажираност",
      firstBenefit4: "Запазване и анализиране на любими създатели",

      secondTitle: "Глобален обхват. Локално въздействие.",
      secondSubtitle: "Комуникирайте и управлявайте кампаниите си на едно място.",
      secondBenefit1: "Вградени съобщения с възможност за споделяне на файлове",
      secondBenefit2: "Брифове за кампании и работни процеси за одобрение на съдържание",
      secondBenefit3: "Сътрудничество в реално време върху чернови на съдържание",
      secondBenefit4: "Интеграция с календар за планиране на публикации",

      thirdTitle: "Прозрачни плащания",
      thirdSubtitle: "Сигурни и безпроблемни плащания както за криейтъри, така и за брандове.",
      thirdBenefit1: "Защита за сигурни транзакции",
      thirdBenefit2: "Поддръжка на множество методи за плащане",
      thirdBenefit3: "Автоматично фактуриране и данъчна документация",
      thirdBenefit4: "Освобождаване на плащания на базата на изпълнени етапи (milestones)",

      fourthTitle: "Анализи и растеж",
      fourthSubtitle: "Проследявайте представянето и оптимизирайте възвръщаемостта (ROI) на вашия маркетинг.",
      fourthBenefit1: "Табла за управление на кампанията в реално време",
      fourthBenefit2: "Анализ на обхвата и ангажираността на аудиторията",
      fourthBenefit3: "Проследяване на ROI и моделиране на приноса (attribution modeling)",
      fourthBenefit4: "Доклади с възможност за експортиране",
    },

    profile: {
      editProfile: "Редактиране",
      getInTouch: "Свържете се",
      cancel: "Отказ",
      shareProfile: "Споделяне на профила",
      logout: "Изход",
      followers: "Последователи",
      engRate: "Ангажираност",
      reach: "Обхват",
      confirmLogout: "Потвърдете",
      sureLogout: "Сигурни ли сте, че искате да излезете?",
      redirectHome: "Ще бъдете пренасочени към началната страница.",
      logOut: "Изход",
      follow: "Последване",
      following: "Последван"
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
        brandCategories: ["Дрехи", "Козметика", "Технологии", "Храни", "Услуги", "Друго"],
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
          "Потвърждение",
        ],
        brand: [
          "Основна информация",
          "Категория и ниша",
          "Държави и бюджет",
          "Начини за сътрудничество",
          "Потвърждение",
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
          title: "Категория и ниша",
          description:
            "Изберете сферата, в която се развива Вашият бранд.",
        },
        3: {
          title: "Начини за сътрудничество",
          description:
            "Изберете как искате да работите със създатели.",
        },
        4: {
          title: "Аудитория и описание",
          description:
            "Помогнете ни да Ви свържем с най-подходящите създатели.",
          helperText:
            "Ще използваме тази информация, за да Ви предложим най-подходящите профили.",
        },
        5: {
          title: "Потвърждение",
          description:
            "Потвърдете, че всичко е наред, преди да изпратите.",
        },

        // Creator-only steps
        creator2: {
          title: "Категория и ниша",
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
        title: "Изберете целеви държави",
        subTitle: "Максимум 3 държави.",
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
      },

      countries: {
        AL: "Албания",
        AD: "Андора",
        AT: "Австрия",
        BY: "Беларус",
        BE: "Белгия",
        BA: "Босна и Херцеговина",
        BG: "България",
        HR: "Хърватия",
        CY: "Кипър",
        CZ: "Чехия",
        DK: "Дания",
        EE: "Естония",
        FI: "Финландия",
        FR: "Франция",
        DE: "Германия",
        GR: "Гърция",
        HU: "Унгария",
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
        description: "Описание",
        collabTypes: "Начини за сътрудничество",
        website: "Уебсайт",
        socialLinks: "Социални мрежи",
        country: "Държава",
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
        socialLink: "Въведете връзка",
        select: "Моля изберете",
        followers: "Моля посочете",
        country: "Вашата държава",
        otherNiche: "Моля опишете",
        selectCountries: "+ Изберете до 3 държави",
        otherCollab: "Моля опишете",
        yourNiche: "Вашата ниша..."
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
        title: "Активирайте влиянието си и печелете",
        description: "Our platform connects content creators with businesses, guaranteeing maximum efficiency and benefit for both parties."
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
        title: "Become a VIP Member",
        subtitle: "Get special privileges and discounts",
        howToTitle: "How to become VIP?",
        step_1: "Download our branded video (you will receive it after signing up)",
        step_2: "Publish it on Instagram and Facebook story with tag @influlink.bg",
        step_3: "Our team will review and approve your account",
        step_4: "Get VIP status with 30% discount for the first 3 months",
        privilegesTitle: "VIP Privileges:",
        privilege_1: "30% discount for 3 months",
        privilege_2: "Priority in campaign selection",
        privilege_3: "Exclusive partnerships",
        privilege_4: "Personal account manager",
        privilege_5: "VIP badge on the profile",
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
      creatorAbout: "For creators",
      register: "Register",
      profile: "Profile"
    },

    common: {
      back: "Back",
      next: "Next",
      submit: "Submit",
      loading: "Submitting...",
    },

    mvpHero: {
      titleFirst: "Where",
      titleSecond: "Brands",
      titleThird: "Meet",
      titleFourth: "Creators",
      subtext: "The ultimate platform for influencer marketing. Find the perfect match, collaborate seamlessly, and grow together.",
      secondaryButton: "Explore Features",
      primaryButton: "Join us",
    },

    mvpAnalytics: {
      title: "Analytics",
      noData: "No data available yet.",
      totalViews: "Total views",
      thisMonth: "this month",
      totalLikes: "Total likes",
      avgEngagement: "Avg. Engagement",
      newFollowers: "New followers",
      engRateTrend: "Engagement trend",
      viewsByPlatform: "Views by device",
      reachTrend: "Reach",
      topPerformingContent: "Top performing content",
      dataNotAvailableYet: "No data available yet.",
      deviceWeb: "Desktop",
      deviceMobile: "Mobile",
      requestVIP: "Request VIP access",
      unlockInsights: "Unlock detailed insights about your audience engagement, reach trends, and performance metrics."
    },

    mvpProfileTabs: {
      portfolio: "Portfolio",
      campaigns: "Campaigns",
      addWork: "Add work",
      yourCampaigns: "Your campaigns",
      noPortfolioItems: "There are no items in this portfolio yet.",
      manageCampaigns: "Manage and track the progress of your campaigns",
      addFirstWork: "Add an item"
    },

    addPost: {
      processImage: "Processing image...",
      upTo: "up to",
      uploadImage: "Upload image",
      continue: "Continue",
      campaignTitle: "Campaign title",
      back: "Back",
      next: "Next",
      brandType: "Brand type",
      selectType: "Select a type...",
      reel: "reel",
      video: "video",
      post: "post",
      blogArticle: "Blog article",
      desc: "Description",
      publish: "Publish",
      publishing: "Publishing",
      addNewWork: "Add new work",
      showcase: "Showcase your best collaborations to brands.",
      campaignImage: "Campaign image",
      campTitle: "Campaign title",
      brandName: "Brand name",
      contentType: "Content type",
      cancel: "Cancel",
      content: "Content"
    },

    joinDialog: {
      findCampaigns: "Find campaigns",
      setYourRates: "Set your rates",
      getPaidDirectly: "Get paid directly",
      postCampaigns: "Post campaigns",
      findCreators: "Find creators",
      trackPerformance: "Track performance",
      title: "Join Influlink",
      selectTypeToStart: "Select account type to get started",
      signIn: "Sign in",
      getStarted: "Get started",
      alreadyAccount: "Already have an account?",
      creatorDesc: "Create content and grow as a creator",
      brandDesc: "Find creators and manage your campaigns"
    },

    mvpNotifications: {
      title: "Notifications",
      proposalAccepted: "Proposal accepted!",
      proposalDeclined: "Proposal declined",
      campaignInvitation: "Campaign invitation",
      proposalReceived: "New proposal received",
      inviteAccepted: "Invite accepted!",
      markAll: "Mark all as read",
      daysAgo: "days ago",
      proposalDetails: "Proposal details",
      message: "Message",
      proposedPrice: "Proposed price",
      status: "Status",
      loadingNotifications: "Loading notifications...",
      clickToViewPortfolio: "Click to view portfolio",
      creator: "Creator",
      brand: "Brand",
      price: "Price",
      type: "Type",
      received: "Received",
      relatedTo: "Related to",
      proposalReceivedMsg: "A creator submitted a proposal for your campaign.",
      proposalAcceptedMsg: "Your proposal was accepted. Get ready to collaborate!",
      proposalRejectedMsg: "Unfortunately, your proposal was not selected this time.",
      campaignInviteMsg: "You have received an invitation to join a new campaign!",
      inviteAcceptedMsg: "A creator has accepted your invitation to join a campaign.",
      inviteDeclinedMsg: "A creator has declined your invitation to join a campaign.",
      typeProposal: "Proposal",
      typeInvite: "Invitation",
      typeMessage: "Message"
    },

    mvpCampaignDetails: {
      title: "Campaign details",
      startDate: "Start date",
      desc: "Description",
      edit: "Edit",
      delete: "Delete",
      media: "Media",
      overview: "Overview",
      analytics: "Analytics",
      primaryGoal: "Primary goal",
      platforms: "Platforms",
      niches: "Niches",
      contentTypes: "Content types",
      country: "Country",
      languages: "Languages",
      budget: "Budget",
      totalBudget: "Total budget",
      budgetTracker: "Budget tracker",
      budgetSpent: "Budget spent",
      of: "of",
      spent: "Spent",
      remaining: "Remaining",
      impressions: "Impressions",
      reach: "Reach",
      companyLogo: "Company logo",
      noLogo: "No logo",
      referenceImages: "Reference images",
    },

    mvpSearchSection: {
      titleFirst: "Find Your",
      titleSecond: "Perfect Creator",
      subTitle: "Search through thousands of verified creators and find the perfect match for your brand",
      niche: "Niche/Category",
      platform: "Platform",
      followersRange: "Followers range",
      followersRangePlaceholder: "Select range",
      country: "Country",
      selectCountry: "Select country",
      language: "Language",
      engagementRate: "Engagement rate",
      vipOnly: "VIP Creators Only",
      searchButton: "Find Creators",
      resetButton: "Reset",
      simpleSearch: "Simple filters",
      advancedSearch: "Advanced filters",
    },

    mvpFeaturesSection: {
      firstTitle: "Easy discovery & Matching",
      firstSubtitle: "Find the perfect creators for your brand with our intelligent matching system.",
      firstBenefit1: "Advanced search filters to narrow down your ideal creators",
      firstBenefit2: "AI-powered matching based on audience demographics",
      firstBenefit3: "Verified creator profiles with authentic engagement metrics",
      firstBenefit4: "Save and analyze your favorite creators",
      secondTitle: "Global Reach. Local impact.",
      secondSubtitle: "Communicate and manage campaigns all in one place.",
      secondBenefit1: "Built-in messaging with file sharing capabilities",
      secondBenefit2: "Campaign briefs and content approval workflows",
      secondBenefit3: "Real-time collaboration on content drafts",
      secondBenefit4: "Calendar integration for scheduling posts",
      thirdTitle: "Transparent payments",
      thirdSubtitle: "Secure, hassle-free payments for both creators and brands.",
      thirdBenefit1: "Protection for secure transactions",
      thirdBenefit2: "Multiple payment methods supported",
      thirdBenefit3: "Automatic invoicing and tax documentation",
      thirdBenefit4: "Milestone-based payment releases",
      fourthTitle: "Analytics & Growth",
      fourthSubtitle: "Track performance and optimize your influencer marketing ROI.",
      fourthBenefit1: "Real-time campaign performance dashboards",
      fourthBenefit2: "Audience reach and engagement analytics",
      fourthBenefit3: "ROI tracking and attribution modeling",
      fourthBenefit4: "Exportable reports",
    },

    mvpLogin: {
      becomeCreator: "Become a Creator",
      welcomeBack: "Welcome back!",
      letsSecureFirst: "Let's secure your account first",
      yourIdentity: "Your identity",
      fullName: "Full name",
      countryCity: "Country / City",
      back: "Back",
      nextStep: "Next Step",
      yourNiche: "Your Niche",
      shortBio: "Short Bio",
      almostThere: "Almost there",
      name: "Name",
      handle: "Handle",
      niche: "Niche",
      iAgreeToThe: "I agree to the",
      termsOfService: "Terms of Service",
      privacy: "Privacy policy",
      creatingAccount: "Create an account",
      confirmAndEnter: "Confirm and enter",
      backToDetails: "Back to details",
      quitWaiting: "Stop waiting",
      startGrowing: "Start growing",
      companyName: "Company name",
      email: "Email",
      password: "Password",
      registering: "Registering...",
      logging: "Logging in...",
      or: "Or",
      signWithGoogle: "Sign in with Google",
      alreadyAccount: "Already have an account? ",
      noAccount: "Don't have an account? ",
      login: "Log In",
      register: "Register",
      registrationSuccess: "Registration successful",
      accountCreatedSuccess: "Your account has been created successfully!",
      continue: "Continue",
      signUp: "Sign Up",
      logIn: "Log In",
      reviewSummary: "Review summary",
      and: "and",
      acknowledgeUse: "I acknowledge the use of essential cookies for account security."
    },

    mvpCampaignSearchSection: {
      titleFirst: "Find",
      titleSecond: "Campaigns",
      subTitle: "Browse active brand campaigns and apply to the ones that fit you best",
      niche: "Niche/Category",
      platform: "Platform",
      country: "Country",
      selectCountry: "Select country",
      language: "Language",
      maxBudget: "Maximum budget",
      searchButton: "Find campaign",
      resetButton: "Clear",
      simpleSearch: "Simple filters",
      advancedSearch: "Advanced filters",
      contentType: "Content type",
      urgentOnly: "Urgent campaigns only",
      urgentText: "High priority campaigns"
    },


    privacy: {
      heroTitle: "Legal & Privacy",
      heroSubtitle: "Transparency and data security for the InfluLink ecosystem.",
      disclosureTitle: "Legal Disclosure (Impressum)",
      companyName: "Company Name",
      registeredOffice: "Registered Office",
      email: "Email",
      companyId: "Company ID (UIC)",
      availableSoon: "208542977",
      detailedPolicyTitle: "Detailed Privacy Policy",
      policyIntro: "This policy describes our practices regarding the collection and use of personal data within the InfluLink platform. We act as the Data Controller under the General Data Protection Regulation (GDPR).",
      basisTitle: "Legal Basis for Processing",
      basisIntro: "We process your data under the following legal bases:",
      basisContract: "Contractual Necessity: To provide the platform services and manage your account.",
      basisLegal: "Legal Obligation: For tax and accounting purposes under Bulgarian law.",
      basisInterest: "Legitimate Interest: To improve platform security and prevent fraudulent activity.",
      sharingTitle: "Data sharing",
      sharingContent: "As a marketplace, specific profile data (usernames, metrics, niches) are visible to registered Brands to facilitate partnerships. We do not sell your personal contact information to third parties.",
      transferTitle: "International transfers",
      transferContent: "While we are based in Bulgaria, some service providers (like payment processors or cloud infrastructure) may process data outside the EEA. We ensure these providers adhere to Standard Contractual Clauses (SCCs).",
      rightsTitle: "Your rights",
      rightsIntro: "Under the GDPR, you have the following rights:",
      right1: "Right to access and data portability.",
      right2: "Right to rectification of profile data.",
      right3: "Right to erasure (\"Right to be forgotten\").",
      right4: "Right to object to direct marketing.",
      cards: {
        controllerTitle: "1. Data Controller",
        controllerContent: "INFLULINK LTD., a Bulgarian registered company. Our primary data storage is located on secure EU-based servers, fully compliant with GDPR regulations.",
        dataTitle: "2. Data We Process",
        dataContent: "We process account identity, professional influencer metrics, campaign data, and transaction history required to facilitate brand-influencer partnerships.",
        securityTitle: "3. Security & Retention",
        securityContent: "Your data is protected by encryption. We retain data as long as your account is active or as required by Bulgarian tax and commercial laws."
      }
    },

    mvpTerms: {
      heroTitle: "Terms of",
      heroTitleSpan: "Service",
      heroSubtitle: "The legal framework for professional collaborations on InfluLink.",
      userAgreementTitle: "User Agreement & Platform Rules",
      lastUpdated: "Last Updated: January 2026",
      roleTitle: "Platform Role",
      roleContent: "InfluLink acts as an intermediary marketplace connecting Brands and Creators. We facilitate connections but are not a party to individual campaign contracts.",
      integrityTitle: "Account Integrity",
      integrityContent: "Users must maintain authentic social media metrics. The use of bots, fake followers, or deceptive engagement is strictly prohibited.",
      paymentsTitle: "Payments & Fees",
      paymentsContent: "Platform fees and payment processing terms apply to successful collaborations as outlined in your specific plan or campaign agreement.",
      s1Title: "1. The Service",
      s1Content: "InfluLink provides a platform for Creators to showcase their portfolio and for Brands to discover and manage influencer marketing campaigns. By creating an account, you agree to comply with these terms and the laws of the Republic of Bulgaria.",
      s2Title: "2. Content Ownership",
      s2Content: "Creators retain the rights to their original content. However, by participating in a campaign through InfluLink, Creators grant Brands a limited, non-exclusive license to use the campaign content as specified in the individual campaign brief.",
      s3Title: "3. Professional Conduct",
      s3Content: "Users agree to act in good faith. Brands must provide clear briefs and timely feedback; Creators must meet deadlines and maintain transparency regarding sponsored content (using #ad or local equivalents).",
      s4Title: "4. Limitation of Liability",
      s4Content: "INFLULINK LTD. is not responsible for the quality, legality, or safety of the services provided by Creators, nor the accuracy of campaign descriptions provided by Brands.",
      s5Title: "5. Dispute Resolution",
      s5Content: "Any contractual disputes regarding payments or deliverables must be resolved directly between the Brand and the Creator. These terms are governed by Bulgarian law.",
      s6Title: "6. Copyright & DMCA",
      s6Content: "InfluLink respects intellectual property rights. In accordance with the EU Copyright Directive and the DMCA, we will respond to notices of alleged infringement.",
      s6Notice: "To file a notice, please provide:",
      s6List1: "Identification of the copyrighted work.",
      s6List2: "The specific URL on InfluLink containing the material.",
      s6List3: "Your contact email and a statement of good faith.",
      s7Title: "7. Payments & Commissions",
      s7Content: "InfluLink may charge service fees for successful collaborations. All financial transactions are processed through authorized third-party providers (e.g., Stripe). Users are responsible for their own tax obligations under Bulgarian law."
    },

    mvpCookies: {
      heroTitle: "Cookie",
      heroTitleSpan: "Policy",
      heroSubtitle: "Transparency about how we use tracking technologies to power the InfluLink experience.",
      sec1Title: "1. What are Cookies?",
      sec1Content: "Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site. On InfluLink, we use cookies to keep you logged in, remember your preferences, and analyze our traffic.",
      sec2Title: "2. Categories of Cookies We Use",
      durationTitle: "Duration",
      sessionTitle: "Session Cookies:",
      sessionContent: "Deleted automatically when you close your browser.",
      persistentTitle: "Persistent Cookies:",
      persistentContent: "Remain on your device for a set period (usually 30 days to 1 year) or until manually deleted.",
      thirdPartyTitle: "Third-Party Cookies",
      thirdPartyContent: "Some cookies are placed by third-party services that appear on our pages (like Google or Stripe). We do not control these cookies directly.",
      sec3Title: "3. Managing Your Preferences",
      sec3Content: "You have the right to decide whether to accept or reject non-essential cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality may be restricted.",
      openSettings: "Open Cookie Settings Panel",
      lastUpdated: "Last Updated: January 2026 • INFLULINK LTD. (Bulgaria)",
      catStrictTitle: "Strictly Necessary Cookies",
      catStrictDesc: "These are essential for you to browse the website and use its features, such as accessing secure areas (Login) and maintaining your session. The platform cannot function without these.",
      catStrictStatus: "Always Active",
      catPerfTitle: "Performance & Analytics",
      catPerfDesc: "We use these to understand how visitors interact with InfluLink. They help us discover which pages are most popular and where we might have technical errors. All data is aggregated and anonymous.",
      catPerfStatus: "Optional",
      catFuncTitle: "Functional Cookies",
      catFuncDesc: "These allow the website to remember choices you make (such as your preferred language or region) to provide a more personalized experience.",
      catFuncStatus: "Optional"
    },

    profile: {
      editProfile: "Edit profile",
      getInTouch: "Get in touch",
      cancel: "Cancel",
      shareProfile: "Share profile",
      logout: "Logout",
      followers: "Followers",
      engRate: "Engagement",
      reach: "Reach",
      confirmLogout: "Confirm logout",
      sureLogout: "Are you sure you want to log out?",
      redirectHome: "You will be redirected to the home page.",
      logOut: "Log out",
      follow: "Follow",
      following: "Following"
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

    editProfile: {
      title: "Edit profile",
      subtitle: "Enter desired changes"
    },

    legal: {
      title: "Legal",
      privacyPolicy: "Privacy Policy",
      terms: "Terms & Conditions",
      cookies: "Cookies"
    },

    mvpCampaignHistory: {
      title: "Campaign history",
      searchCampaigns: "Search campaigns",
      campaign: "Campaign",
      status: "Status",
      brand: "Brand",
      reach: "Reach",
      engagement: "Engagement",
      earnings: "Earnings",
      desc: "Description",
      back: "Back",
      certifiedMetrics: "Certified metrics",
      performanceSince: "Performance since",
      engagementRate: "Engagement rate",
      trafficInsights: "Traffic insights",
      reportGenerated: "Report generated",
      downloadPDF: "Download PDF",
      data: "Data",
      viewAnalytics: "View analytics",
      impressions: "Impressions",
      completed: "Completed",
      inProgress: "In Progress",
      pending: "Pending"
    },

    mvpCreateCampaign: {
      name: "Campaign name",
      desc: "Description",
      type: "Type",
      emailCampaign: "Email campaign",
      socialMedia: "Social media",
      paidAd: "Paid ads",
      contentMarketing: "Content marketing",
      startDate: "Start date",
      primaryGoal: "Primary goal",
      reach: "Reach",
      conversions: "Conversions",
      engagement: "Engagement",
      brandAwareness: "Brand awareness",
      totalBudget: "Total budget",
      platforms: "Platforms",
      niches: "Niches",
      audienceContent: "Audience content",
      contentTypes: "Content types",
      targetCountry: "Target country",
      selectCountry: "Select country",
      languages: "Languages",
      companyLogo: "Logo",
      optional: "Optional",
      refImages: "Reference Images",
      step: "Step",
      of: "of",
      back: "Back",
      nextStep: "Next step",
      selectType: "Select Type",
      describe: "Describe your primary goal and target audience...",
      step1Title: "Core details",
      step1Desc: "Define the fundamental aspects of your campaign",
      step2Title: "Goals & Budget",
      step2Desc: "Set your objectives and allocate the necessary funds",
      step3Title: "Targeting & Filters",
      step3Desc: "Choose platforms, niches, and audience reach",
      step4Title: "Media & Branding",
      step4Desc: "Upload logos and creative references",
      platformsNiches: "Platforms & Niches",
      createButton: "Create campaign",
      tooltip: "Upload visuals to help creators understand your brand style.",
      post: "Post",
      video: "Video",
      story: "Story",
      reel: "Reel",
      livestream: "Live",
      english: "English",
      german: "German",
      french: "French",
      spanish: "Spanish",
      bulgarian: "Bulgarian",
      paidAds: "Paid ads"
    },

    mvpRegisterBrand: {
      launchYourBrand: "Launch your brand",
      welcomeBack: "Welcome back!",
      setupBusinessAcc: "Let's setup your business account",
      businessIdentity: "Business identity",
      benefit1: "Your brand name and headquarters location help us match you with creators who align with your regional market goals.",
      companyName: "Company name",
      brandUsername: "Brand username",
      headquarters: "Headquarters",
      cityCountry: "City, Country",
      nextStep: "Next step",
      industryFocus: "Industry focus",
      benefit2: "Selecting your industry allows our algorithm to recommend creators with a proven track record in your specific market segment.",
      primaryIndustry: "Primary industry",
      selectYourIndustry: "Select your industry",
      companyBioMission: "Company bio / mission",
      tellCreatorsWhatStand: "Tell creators what you stand for.",
      back: "Back",
      finalize: "Finalize",
      businessSummary: "Business summary",
      brand: "Brand",
      industry: "Industry",
      creatingBrandProfile: "Creating brand profile...",
      confirmLaunch: "Confirm & launch",
      backDetails: "Back to details",
      buildYour: "Build your",
      brandLegacy: "Brand's legacy",
      brandAdvantage:"Advantage",
      partnerWithPros:"Partner with Pros",
      crossBridgeBetween: "Cross the bridge between professional brands and world-class creators.",
      benefit3: "By joining, you unlock the ability to post campaigns and use our automated creator contracting tools."
    },

    cookies: {
      banner: {
        title: "Cookie Preferences",
        description: "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. You can manage your choices at any time."
      },
      buttons: {
        settings: "Cookie Settings",
        acceptAll: "Accept All",
        declineAll: "Decline Non-Essential",
        saveChoice: "Save My Preferences"
      },
      settings: {
        title: "Privacy Settings",
        description: "Review and authorize the categories of cookies you are comfortable with us using."
      },
      misc: {
        essentialTag: "Essential"
      },
      categories: {
        essential: {
          name: "Strictly Necessary",
          description: "Required for core site features such as security and account access. These do not store personal data and cannot be disabled."
        },
        analytics: {
          "name": "Analytics & Performance",
          "description": "Help us understand how visitors interact with the site, discover popular content, and identify technical issues to improve the experience."
        },
        marketing: {
          "name": "Marketing & Social Media",
          "description": "Used to track visitor interests and show more relevant ads across social platforms and other websites."
        }
      }
    },

    drivesUs: {
      title: "What drives us",
      card1Title: "Our mission",
      card1Content: "To make the collaboration between creators and brands an easy process, through an effective and oriented towards quality platform, that creates real value and measurable growth.",
      card2Title: "Our values",
      card2Content: "Quality, transparency and authenticity. We believe in niche influence and lasting partnerships.",
      card3Title: "Our vision",
      card3Content: "To set a new standard through quality, trust and lasting growth."
    },

    links: {
      title: "Active links",
      subtitle: "People and brands you are currently working with",
      chat: "Chat",
      noActive: "No active collaborators found.",
      searchBy: "Search by name or @handle..."
    },

    dock: {
      campaigns: "Campaigns",
      newCampaign: "New campaign",
      chat: "Chat",
      links: "Links"
    },

    deleteCampaign: {
      title: "Delete campaign?",
      sureToDelete: "Are you sure you want to delete ",
      warning: "This action cannot be undone. All campaign data, analytics, and media will be permanently removed.",
      cancel: "Cancel",
      deleteButton: "Delete"
    },

    chat: {
      typeMesssage: "Type a message...",
      online: "Online",
      offline: "Offline"
    },

    contacts: {
      title: "Contact us",
      subtitle: "Have any questions? Our team is available 24/7 to offer you assistance",
      email: "Email",
      location: "Location",
      locationValue: "Bulgaria",
      workHours: "Work hours",
      workHoursValue: "Support 24/7",
      sendMessage: "Send us a message",
      name: "Name",
      namePlaceholder: "Your name",
      subject: "Subject",
      subjectPlaceholder: "What is your message about?",
      message: "Message",
      messagePlaceholder: "Your message...",
      button: "Send"
    },

    footer: {
      slogan: "Global reach. Local impact.",
      rights: "All rights reserved",
      nav: {
        title: "Navigation",
        home: "Home",
        contact: "Contacts",
        about: "About us"
      },
      support: "24/7 Support",
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
        brandCategories: ["Clothing", "Cosmetics", "Technology", "Food", "Services", "Other"],
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
          "Confirmation",
        ],
        brand: [
          "Basic Information",
          "Category & Niche",
          "Target Countries & Budget",
          "Collaboration Methods",
          "Confirmation",
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
        title: "Choose target countries",
        subTitle: "Maximum 3 countries.",
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
          title: "Category & Niche",
          description: "Select the area in which your brand operates.",
        },
        3: {
          title: "Collaboration Types",
          description: "Choose how you want to work with creators.",
        },
        4: {
          title: "Audience & Description",
          description:
            "Help us connect you with the most relevant creators.",
          helperText:
            "We use this information to match you with the right profiles.",
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
        selectCountries: "+ Choose up to 3 countries",
        selectOneCountry: "+ Choose 1 country",
        followers: "Please enter",
        select: "Please choose",
        otherNiche: "Please enter",
        otherCollab: "Please enter",
        yourNiche: "Your niche..."
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
        title: "Activate your influence and earn",
        description: "Our platform connects content creators with businesses, guaranteeing maximum efficiency and benefit for both parties."
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
        title: "Become a VIP Member",
        subtitle: "Get special privileges and discounts",
        howToTitle: "How to become VIP?",
        step_1: "Download our branded video (you will receive it after signing up)",
        step_2: "Publish it on Instagram and Facebook story with tag @influlink.bg",
        step_3: "Our team will review and approve your account",
        step_4: "Get VIP status with 30% discount for the first 3 months",
        privilegesTitle: "VIP Privileges:",
        privilege_1: "30% discount for 3 months",
        privilege_2: "Priority in campaign selection",
        privilege_3: "Exclusive partnerships",
        privilege_4: "Personal account manager",
        privilege_5: "VIP badge on the profile",
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
  }
};

export type Language = "bg" | "en";