"use strict";

/* --------------------------------------------------------------------------
   CAMPAIGN DATA
   The engine below does not know what a school, umbrella, or heroine is.
   It reads characters, locations, events, requirements, choices, and memories.
-------------------------------------------------------------------------- */
const CAMPAIGN = {
  meta: {
    id: "kisaragi_academy",
    title: "Kisaragi Academy",
    version: "1.2",
    adultCast: true,
    maxDemoDays: 3
  },

  phases: ["Morning Class", "Lunch", "Homeroom", "After School"],

  calendarEvents: [
    { id: "welcome_festival", title: "Welcome Festival", day: 6 }
  ],

  locations: {
    classroom_2b: { name: "Classroom 2-B", tags: ["school", "classroom"] },
    library_courtyard: { name: "Library Courtyard", tags: ["school", "quiet"] },
    central_courtyard: { name: "Central Courtyard", tags: ["school", "outdoors"] },
    cafeteria: { name: "Cafeteria", tags: ["school", "social"] },
    old_gym_hall: { name: "Old Gym Hallway", tags: ["school", "quiet"] },
    academy_gate: { name: "Academy Gate", tags: ["school", "outdoors"] },
    station_road: { name: "Station Road", tags: ["town", "commute"] },
    used_bookstore: { name: "Used Bookstore", tags: ["town", "quiet"] },
    council_annex: { name: "Student Council Annex", tags: ["school", "private"] },
    home: { name: "Home", tags: ["private"] }
  },

  characters: {
    reina: {
      name: "Reina Tachibana",
      romanceable: true,
      archetypes: ["tsundere", "himedere"],
      traits: ["proud", "responsible", "competitive"],
      likes: ["competence", "responsibility", "quiet praise"],
      dislikes: ["public embarrassment", "sloppy work"],
      schedule: {
        "Morning Class": ["classroom_2b"],
        "Lunch": ["central_courtyard", "classroom_2b"],
        "Homeroom": ["classroom_2b"],
        "After School": ["academy_gate", "council_annex"]
      }
    },
    mio: {
      name: "Mio Kurose",
      romanceable: true,
      archetypes: ["dandere", "kuudere"],
      traits: ["quiet", "observant", "blunt"],
      likes: ["mystery novels", "silence", "direct questions"],
      dislikes: ["noise", "forced small talk"],
      schedule: {
        "Morning Class": ["classroom_2b"],
        "Lunch": ["library_courtyard"],
        "Homeroom": ["classroom_2b"],
        "After School": ["used_bookstore"]
      }
    },
    akane: {
      name: "Akane Shinohara",
      romanceable: true,
      archetypes: ["mayadere", "yandere"],
      traits: ["guarded", "loyal", "intense"],
      likes: ["honesty", "privacy", "commitment"],
      dislikes: ["gossip", "inconsistency", "being dismissed"],
      schedule: {
        "Morning Class": ["classroom_2b"],
        "Lunch": ["old_gym_hall"],
        "Homeroom": ["classroom_2b"],
        "After School": ["old_gym_hall"]
      }
    },
    chiyo: {
      name: "Chiyo Fujimoto",
      romanceable: true,
      nickname: "Chi-chan",
      archetypes: ["deredere", "bakadere"],
      traits: ["energetic", "warm", "impulsive"],
      likes: ["pastries", "nicknames", "including people"],
      dislikes: ["loneliness", "awkward silence", "wasted food"],
      schedule: {
        "Morning Class": ["classroom_2b"],
        "Lunch": ["cafeteria"],
        "Homeroom": ["classroom_2b"],
        "After School": ["station_road"]
      }
    },
    kaori: {
      name: "Kaori Saionji",
      romanceable: true,
      archetypes: ["kamidere", "gap"],
      traits: ["composed", "ambitious", "secretly messy"],
      likes: ["order", "competence", "instant noodles"],
      dislikes: ["public failure", "unplanned scrutiny"],
      schedule: {
        "Morning Class": ["council_annex"],
        "Lunch": ["council_annex"],
        "Homeroom": ["classroom_2b"],
        "After School": ["council_annex"]
      }
    }
  },

  events: [
    {
      id: "day1_transfer_intro",
      phase: "Morning Class",
      focus: "reina",
      location: "classroom_2b",
      baseWeight: 1000,
      once: true,
      requirements: [
        { type: "dayEq", value: 1 },
        { type: "notMemory", id: "transfer_introduction" }
      ],
      title: "The Transfer Student",
      text: "Kisaragi Senior Academy feels like an anime school drama—except every student enrolled here is eighteen or older.\n\nAs you enter Classroom 2-B, conversations stop. Reina Tachibana watches you with guarded interest.",
      choices: [
        {
          label: "Introduce yourself politely.",
          result: "Your introduction is brief and polite.\n\n“Acceptable,” Reina murmurs.",
          effects: [
            { type: "relationship", character: "reina", amount: 1 },
            { type: "reputation", amount: 1 },
            { type: "memory", memory: { id: "transfer_introduction", title: "A Calm Introduction", participants: ["player","reina"], importance: 5, emotion: "calm", tags: ["school","introduction"], summary: "Introduced myself politely to Class 2-B." } }
          ]
        },
        {
          label: "Give only your name.",
          result: "You give your name and nothing else.\n\nReina studies you for another second before looking away.",
          effects: [
            { type: "relationship", character: "reina", amount: 2 },
            { type: "reputation", amount: 1 },
            { type: "emotion", character: "reina", key: "curiosity", amount: 2 },
            { type: "memory", memory: { id: "transfer_introduction", title: "A Mysterious Introduction", participants: ["player","reina"], importance: 6, emotion: "curiosity", tags: ["school","introduction"], summary: "Kept my introduction deliberately mysterious." } }
          ]
        },
        {
          label: "“You’ll learn the interesting parts later.”",
          result: "A few students laugh. Reina does not—but a faint blush betrays her.\n\n“Try surviving the day before becoming dramatic.”",
          effects: [
            { type: "relationship", character: "reina", amount: 1 },
            { type: "reputation", amount: 2 },
            { type: "emotion", character: "reina", key: "embarrassment", amount: 2 },
            { type: "memory", memory: { id: "transfer_introduction", title: "A Bold Introduction", participants: ["player","reina"], importance: 6, emotion: "amusement", tags: ["school","introduction","teasing"], summary: "Teased the class during my introduction." } }
          ]
        }
      ]
    },

    {
      id: "morning_reina_callback",
      phase: "Morning Class",
      focus: "reina",
      location: "classroom_2b",
      baseWeight: 30,
      requirements: [{ type: "dayGte", value: 2 }],
      title: "Before the Bell",
      variants: [
        {
          requirements: [{ type: "memory", id: "shared_umbrella" }],
          text: "Reina places a neatly folded worksheet on your desk before the bell.\n\n“You missed one announcement yesterday,” she says. “I wrote it down. This has nothing to do with the umbrella.”"
        },
        {
          requirements: [{ type: "relationshipGte", character: "reina", value: 4 }],
          text: "Reina pauses beside your desk.\n\n“You are adapting faster than expected,” she says, almost approvingly."
        }
      ],
      text: "Reina gives you a concise explanation of the morning assignment, then insists she was merely preventing the class average from dropping.",
      choices: [
        {
          label: "Thank her sincerely.",
          result: "Reina looks away. “Obviously you should be grateful.”",
          effects: [
            { type: "relationship", character: "reina", amount: 2 },
            { type: "emotion", character: "reina", key: "embarrassment", amount: 1 },
            { type: "memory", memory: { id: "reina_morning_help", title: "Morning Notes", participants: ["player","reina"], importance: 4, emotion: "warmth", tags: ["class","help"], summary: "Reina helped me catch up before class." } }
          ]
        },
        {
          label: "Tease her for worrying.",
          result: "“I was not worried.” Her answer arrives much too quickly.",
          effects: [
            { type: "relationship", character: "reina", amount: 1 },
            { type: "emotion", character: "reina", key: "embarrassment", amount: 2 }
          ]
        }
      ]
    },

    {
      id: "morning_mio_observation",
      phase: "Morning Class",
      focus: "mio",
      location: "classroom_2b",
      baseWeight: 24,
      requirements: [
        { type: "dayGte", value: 2 },
        { type: "met", character: "mio" }
      ],
      title: "Margin Notes",
      text: "Mio slides your worksheet back across the aisle.\n\n“You skipped a step. The answer is correct, but your reasoning vanished.”",
      choices: [
        {
          label: "Ask her to explain the missing step.",
          result: "Mio explains it in eleven words, then looks mildly pleased when you understand.",
          effects: [
            { type: "relationship", character: "mio", amount: 2 },
            { type: "memory", memory: { id: "mio_margin_notes", title: "Margin Notes", participants: ["player","mio"], importance: 4, emotion: "trust", tags: ["class","study"], summary: "Mio corrected my reasoning before class." } }
          ]
        }
      ]
    },

    {
      id: "lunch_mio_library",
      phase: "Lunch",
      focus: "mio",
      location: "library_courtyard",
      baseWeight: 38,
      requirements: [],
      title: "Library Steps",
      variants: [
        {
          requirements: [{ type: "memory", id: "mio_book_recommendation" }],
          text: "Mio is waiting behind the library with a second book resting beside her.\n\n“You finished the first recommendation, presumably. This one is less forgiving.”"
        },
        {
          requirements: [{ type: "met", character: "mio" }],
          text: "Mio looks up as you approach the library steps.\n\n“You returned. That suggests either good judgment or limited imagination.”"
        }
      ],
      text: "Behind the library, a silver-haired girl sits with a mystery novel.\n\n“You look like you’re hiding, not socializing. You may sit.”\n\nHer name is Mio Kurose.",
      choices: [
        {
          label: "Sit quietly beside her.",
          result: "Mio eventually offers you a wrapped candy.\n\n“You chew less loudly than most people.”",
          effects: [
            { type: "meet", character: "mio" },
            { type: "relationship", character: "mio", amount: 2 },
            { type: "emotion", character: "mio", key: "curiosity", amount: 1 },
            { type: "memory", memory: { id: "quiet_lunch_mio", title: "Comfortable Silence", participants: ["player","mio"], importance: 5, emotion: "comfort", tags: ["lunch","quiet"], summary: "Shared a peaceful lunch with Mio." } }
          ]
        },
        {
          label: "Ask about her book.",
          result: "“The transfer student did it,” Mio says.\n\n“I’m joking. Probably.”",
          effects: [
            { type: "meet", character: "mio" },
            { type: "relationship", character: "mio", amount: 2 },
            { type: "emotion", character: "mio", key: "curiosity", amount: 2 },
            { type: "memory", memory: { id: "mio_book_recommendation", title: "The Mystery Recommendation", participants: ["player","mio"], importance: 6, emotion: "interest", tags: ["lunch","book"], summary: "Mio recommended a locked-room mystery." } }
          ]
        },
        {
          label: "Peek at the title unnoticed. [DC 12]",
          roll: {
            dc: 12,
            successText: "You identify the title without leaning too obviously.\n\n“Six out of ten,” Mio says.",
            failureText: "Mio taps your forehead with the book.\n\nKenji appears at the worst possible moment. “Emergency social rescue!”",
            successEffects: [
              { type: "meet", character: "mio" },
              { type: "relationship", character: "mio", amount: 2 },
              { type: "reputation", amount: 1 },
              { type: "memory", memory: { id: "mio_book_peek", title: "A Subtle Glance", participants: ["player","mio"], importance: 4, emotion: "amusement", tags: ["lunch","dice"], summary: "Successfully identified Mio's book without asking." } }
            ],
            failureEffects: [
              { type: "meet", character: "mio" },
              { type: "relationship", character: "mio", amount: -1 },
              { type: "memory", memory: { id: "mio_book_peek_fail", title: "Caught Peeking", participants: ["player","mio"], importance: 4, emotion: "embarrassment", tags: ["lunch","failure"], summary: "Mio caught me trying to peek at her book." } }
            ]
          }
        }
      ]
    },

    {
      id: "lunch_reina_papers",
      phase: "Lunch",
      focus: "reina",
      location: "central_courtyard",
      baseWeight: 34,
      requirements: [],
      title: "Courtyard Papers",
      variants: [
        {
          requirements: [{ type: "memory", id: "reina_papers_help" }],
          text: "Another gust catches Reina’s festival paperwork.\n\nThis time she looks directly at you. “Don’t just stand there. You already know the procedure.”"
        },
        {
          requirements: [{ type: "relationshipGte", character: "reina", value: 4 }],
          text: "Reina is sorting festival papers in the courtyard. She has left a deliberate empty space beside her.\n\n“You may help, if you are capable of following alphabetical order.”"
        }
      ],
      text: "A sudden gust scatters Reina’s festival papers across the courtyard.\n\nOne page lands at your feet.",
      choices: [
        {
          label: "Help gather the papers.",
          result: "“Thank you,” Reina says. “That was basic human decency. Don’t misunderstand.”",
          effects: [
            { type: "relationship", character: "reina", amount: 2 },
            { type: "emotion", character: "reina", key: "embarrassment", amount: 1 },
            { type: "memory", memory: { id: "reina_papers_help", title: "Scattered Papers", participants: ["player","reina"], importance: 5, emotion: "gratitude", tags: ["lunch","festival"], summary: "Helped Reina recover festival papers." } }
          ]
        },
        {
          label: "Make her ask nicely.",
          result: "After a long pause, Reina mutters, “Please.”",
          effects: [
            { type: "relationship", character: "reina", amount: 1 },
            { type: "reputation", amount: 1 },
            { type: "emotion", character: "reina", key: "embarrassment", amount: 2 },
            { type: "memory", memory: { id: "reina_said_please", title: "Say Please", participants: ["player","reina"], importance: 5, emotion: "embarrassment", tags: ["lunch","teasing"], summary: "Made Reina ask nicely for a festival paper." } }
          ]
        },
        {
          label: "Catch one before it reaches the fountain. [DC 12]",
          roll: {
            dc: 12,
            successText: "You catch the page at the fountain’s edge.\n\n“That was... competent.”",
            failureText: "You slip. Kenji catches the back of your uniform.\n\n“Attempting a water scene already?”",
            successEffects: [
              { type: "relationship", character: "reina", amount: 3 },
              { type: "reputation", amount: 1 },
              { type: "memory", memory: { id: "fountain_save", title: "Fountain Save", participants: ["player","reina"], importance: 6, emotion: "impressed", tags: ["lunch","dice"], summary: "Saved Reina's paper from the fountain." } }
            ],
            failureEffects: [
              { type: "reputation", amount: -1 },
              { type: "memory", memory: { id: "fountain_failure", title: "Almost a Water Scene", participants: ["player","reina","kenji"], importance: 4, emotion: "embarrassment", tags: ["lunch","failure"], summary: "Nearly fell into the fountain before Kenji intervened." } }
            ]
          }
        }
      ]
    },

    {
      id: "lunch_chiyo_collision",
      phase: "Lunch",
      focus: "chiyo",
      location: "cafeteria",
      baseWeight: 28,
      requirements: [],
      title: "Cafeteria Collision",
      variants: [
        {
          requirements: [{ type: "met", character: "chiyo" }],
          text: "Chiyo spots you across the cafeteria and immediately changes direction.\n\n“Emergency lunch partner acquired!”"
        }
      ],
      text: "A girl carrying two lunch trays turns too quickly and walks directly into you.\n\nSomehow, you catch both trays.\n\n“Whoa! Nice reflexes! I’m Chiyo. Most people call me Chi-chan.”",
      choices: [
        {
          label: "Call her Chi-chan immediately.",
          result: "“Zero hesitation. I respect that.”\n\nShe claims the seat across from you.",
          effects: [
            { type: "meet", character: "chiyo" },
            { type: "relationship", character: "chiyo", amount: 2 },
            { type: "reputation", amount: 1 },
            { type: "memory", memory: { id: "chiyo_nickname", title: "Chi-chan", participants: ["player","chiyo"], importance: 6, emotion: "joy", tags: ["lunch","nickname"], summary: "Met Chiyo and immediately called her Chi-chan." } }
          ]
        },
        {
          label: "Ask why she has two lunches.",
          result: "“Emergency backup lunch.”\n\nShe says this as though everyone carries one.",
          effects: [
            { type: "meet", character: "chiyo" },
            { type: "relationship", character: "chiyo", amount: 2 },
            { type: "memory", memory: { id: "chiyo_backup_lunch", title: "Emergency Backup Lunch", participants: ["player","chiyo"], importance: 5, emotion: "amusement", tags: ["lunch","food"], summary: "Learned that Chiyo carries an emergency backup lunch." } }
          ]
        }
      ]
    },

    {
      id: "lunch_akane_observation",
      phase: "Lunch",
      focus: "akane",
      location: "old_gym_hall",
      baseWeight: 20,
      requirements: [{ type: "reputationGte", value: 1 }],
      title: "The Old Gym Hallway",
      variants: [
        {
          requirements: [{ type: "memory", id: "akane_respected_space" }],
          text: "Akane is waiting near the old gym.\n\n“You listened last time,” she says. “That is rarer than it should be.”"
        }
      ],
      text: "A dark-haired girl leans against the old gym wall.\n\n“You are louder than I expected,” she says.\n\n“Akane Shinohara. Don’t make me regret introducing myself.”",
      choices: [
        {
          label: "Ask what she heard about you.",
          result: "“Enough to know people are watching you.”\n\nHer eyes remain on yours.",
          effects: [
            { type: "meet", character: "akane" },
            { type: "relationship", character: "akane", amount: 2 },
            { type: "memory", memory: { id: "akane_rumors", title: "Rumors Travel", participants: ["player","akane"], importance: 6, emotion: "suspicion", tags: ["lunch","rumor"], summary: "Akane warned me that people are watching." } }
          ]
        },
        {
          label: "Respect her distance and leave.",
          result: "You nod and leave.\n\nWhen you glance back, she is still watching.",
          effects: [
            { type: "meet", character: "akane" },
            { type: "relationship", character: "akane", amount: 1 },
            { type: "emotion", character: "akane", key: "trust", amount: 2 },
            { type: "memory", memory: { id: "akane_respected_space", title: "Respecting Distance", participants: ["player","akane"], importance: 6, emotion: "trust", tags: ["lunch","boundaries"], summary: "Gave Akane space after meeting her." } }
          ]
        }
      ]
    },

    {
      id: "homeroom_festival",
      phase: "Homeroom",
      focus: "reina",
      location: "classroom_2b",
      baseWeight: 100,
      requirements: [],
      title: "Festival Committee",
      variants: [
        {
          requirements: [{ type: "memory", id: "festival_volunteer" }],
          text: "The festival committee reconvenes.\n\nReina has already placed the unpleasant task list on your desk. “You volunteered. I remembered.”"
        },
        {
          requirements: [{ type: "dayGte", value: 2 }],
          text: "Festival planning resumes. Reina has transformed yesterday’s notes into a terrifyingly organized schedule."
        }
      ],
      text: "Ms. Ayase assigns you and Reina to festival logistics.\n\nReina questions why a new student was given responsibility.",
      choices: [
        {
          label: "Support Reina's leadership.",
          result: "“Well. Obviously,” Reina says, visibly flustered.",
          effects: [
            { type: "relationship", character: "reina", amount: 3 },
            { type: "emotion", character: "reina", key: "embarrassment", amount: 2 },
            { type: "memory", memory: { id: "supported_reina", title: "An Unexpected Ally", participants: ["player","reina"], importance: 6, emotion: "validation", tags: ["homeroom","festival"], summary: "Supported Reina as logistics lead." } }
          ]
        },
        {
          label: "Argue for shared work.",
          result: "Reina’s three private checklists undermine her objection.",
          effects: [
            { type: "relationship", character: "reina", amount: 1 },
            { type: "reputation", amount: 1 },
            { type: "memory", memory: { id: "shared_festival_work", title: "Division of Labor", participants: ["player","reina"], importance: 5, emotion: "respect", tags: ["homeroom","festival"], summary: "Argued for sharing festival responsibilities." } }
          ]
        },
        {
          label: "Take the unpleasant jobs.",
          result: "Reina is suspicious, but accepts your help.",
          effects: [
            { type: "relationship", character: "reina", amount: 2 },
            { type: "reputation", amount: 1 },
            { type: "memory", memory: { id: "festival_volunteer", title: "The Unwanted Jobs", participants: ["player","reina"], importance: 7, emotion: "reliability", tags: ["homeroom","festival"], summary: "Volunteered for the unpleasant festival jobs." } }
          ]
        }
      ]
    },

    {
      id: "after_reina_umbrella",
      phase: "After School",
      focus: "reina",
      location: "academy_gate",
      baseWeight: 45,
      requirements: [{ type: "weatherEq", value: "Rain" }],
      title: "Shared Umbrella",
      variants: [
        {
          requirements: [{ type: "memory", id: "shared_umbrella" }],
          text: "Rain begins again.\n\nReina lifts the same umbrella without looking at you. “We already established the efficient arrangement.”"
        }
      ],
      text: "Rain falls beyond the academy gate.\n\nReina lifts her umbrella. “The station is on my route.”",
      choices: [
        {
          label: "Accept graciously.",
          result: "The walk is quiet but comfortable.",
          effects: [
            { type: "relationship", character: "reina", amount: 2 },
            { type: "memory", memory: { id: "shared_umbrella", title: "Shared Umbrella", participants: ["player","reina"], importance: 8, emotion: "comfort", tags: ["after_school","rain"], summary: "Walked to the station beneath Reina's umbrella." } },
            { type: "message", from: "reina", text: "You made it home, correct? This is only about tomorrow's committee work." }
          ]
        },
        {
          label: "Say, “How romantic.”",
          result: "“It is weather-related transportation.”\n\nShe does not make you leave.",
          effects: [
            { type: "relationship", character: "reina", amount: 2 },
            { type: "emotion", character: "reina", key: "embarrassment", amount: 3 },
            { type: "memory", memory: { id: "shared_umbrella", title: "Weather-Related Transportation", participants: ["player","reina"], importance: 8, emotion: "embarrassment", tags: ["after_school","rain","teasing"], summary: "Teased Reina while sharing her umbrella." } },
            { type: "message", from: "reina", text: "Do not misinterpret the umbrella situation." }
          ]
        }
      ]
    },

    {
      id: "after_chiyo_pastries",
      phase: "After School",
      focus: "chiyo",
      location: "station_road",
      baseWeight: 31,
      requirements: [],
      title: "Station Road Detour",
      variants: [
        {
          requirements: [{ type: "memory", id: "chiyo_pastries" }],
          text: "Chiyo falls into step beside you, already carrying a pastry bag.\n\n“I learned from last time. Today there are only five.”"
        }
      ],
      text: "Chiyo waves both arms from across the road.\n\n“Transfer student! Walk with me. I need someone responsible enough to stop me from buying six pastries.”",
      choices: [
        {
          label: "Agree to supervise.",
          result: "She buys four.\n\n“That counts as restraint.”",
          effects: [
            { type: "meet", character: "chiyo" },
            { type: "relationship", character: "chiyo", amount: 2 },
            { type: "memory", memory: { id: "chiyo_pastries", title: "Pastry Supervision", participants: ["player","chiyo"], importance: 5, emotion: "fun", tags: ["after_school","food"], summary: "Walked to the station and supervised Chiyo's pastry purchase." } }
          ]
        },
        {
          label: "Encourage all six pastries.",
          result: "She buys six and hands two to you.\n\n“You’re officially fun.”",
          effects: [
            { type: "meet", character: "chiyo" },
            { type: "relationship", character: "chiyo", amount: 3 },
            { type: "reputation", amount: 1 },
            { type: "memory", memory: { id: "chiyo_pastries", title: "A Terrible Influence", participants: ["player","chiyo"], importance: 6, emotion: "joy", tags: ["after_school","food"], summary: "Encouraged Chiyo's six-pastry plan." } }
          ]
        }
      ]
    },

    {
      id: "after_mio_bookstore",
      phase: "After School",
      focus: "mio",
      location: "used_bookstore",
      baseWeight: 27,
      requirements: [{ type: "met", character: "mio" }],
      title: "The Used Bookstore",
      text: "You find Mio comparing two editions of the same mystery novel.\n\n“One has better paper. The other has better footnotes. This is a real problem.”",
      choices: [
        {
          label: "Help her compare.",
          result: "Mio listens to your reasoning and selects one.\n\n“Useful,” she says.",
          effects: [
            { type: "relationship", character: "mio", amount: 2 },
            { type: "memory", memory: { id: "mio_bookstore", title: "Two Editions", participants: ["player","mio"], importance: 5, emotion: "trust", tags: ["after_school","book"], summary: "Helped Mio choose between two book editions." } }
          ]
        },
        {
          label: "Tell her to buy both.",
          result: "Mio stares at you, then buys both.\n\n“I dislike that your answer was effective.”",
          effects: [
            { type: "relationship", character: "mio", amount: 2 },
            { type: "reputation", amount: 1 },
            { type: "memory", memory: { id: "mio_bookstore", title: "The Obvious Solution", participants: ["player","mio"], importance: 5, emotion: "amusement", tags: ["after_school","book"], summary: "Convinced Mio to buy both editions." } }
          ]
        }
      ]
    },

    {
      id: "lunch_chiyo_mio_group",
      phase: "Lunch",
      focus: "chiyo",
      groupParticipants: ["chiyo","mio"],
      location: "cafeteria",
      baseWeight: 24,
      requirements: [
        { type: "met", character: "chiyo" },
        { type: "met", character: "mio" }
      ],
      title: "An Unlikely Lunch Table",
      text: "Chiyo has somehow convinced Mio to join her in the cafeteria.\n\nMio looks at you. “She used the phrase ‘mandatory friendship.’”\n\nChiyo beams. “And it worked!”",
      choices: [
        {
          label: "Join them.",
          result: "Chiyo carries the conversation. Mio quietly corrects half of her facts.\n\nSomehow, the table works.",
          effects: [
            { type: "relationship", character: "chiyo", amount: 2 },
            { type: "relationship", character: "mio", amount: 2 },
            { type: "memory", memory: { id: "chiyo_mio_group_lunch", title: "Mandatory Friendship", participants: ["player","chiyo","mio"], importance: 7, emotion: "fun", tags: ["lunch","group"], summary: "Joined Chiyo and Mio for an unlikely group lunch." } }
          ]
        }
      ]
    },

    {
      id: "after_reina_kaori_tension",
      phase: "After School",
      focus: "reina",
      groupParticipants: ["reina","kaori"],
      location: "council_annex",
      baseWeight: 19,
      requirements: [
        { type: "met", character: "kaori" },
        { type: "relationshipGte", character: "reina", value: 3 }
      ],
      title: "Council Friction",
      text: "Reina and Kaori are locked in a perfectly polite disagreement over festival priorities.\n\nThe politeness somehow makes it more dangerous.",
      choices: [
        {
          label: "Help them find a compromise.",
          result: "Neither admits you helped.\n\nBoth use your compromise anyway.",
          effects: [
            { type: "relationship", character: "reina", amount: 1 },
            { type: "relationship", character: "kaori", amount: 1 },
            { type: "reputation", amount: 1 },
            { type: "memory", memory: { id: "reina_kaori_compromise", title: "Council Compromise", participants: ["player","reina","kaori"], importance: 7, emotion: "respect", tags: ["after_school","group","festival"], summary: "Helped Reina and Kaori resolve a festival disagreement." } }
          ]
        }
      ]
    },

    {
      id: "after_kaori_noodles",
      phase: "After School",
      focus: "kaori",
      location: "council_annex",
      baseWeight: 18,
      requirements: [{ type: "reputationGte", value: 2 }],
      title: "Behind the Council Annex",
      variants: [
        {
          requirements: [{ type: "memory", id: "kaori_noodle_secret" }],
          text: "Kaori is behind the annex with another cup of instant noodles.\n\n“You have already been cleared for this classified location.”"
        }
      ],
      text: "Behind the council annex, the immaculate student council president is crouched beside a cup of instant noodles.\n\nShe freezes. “You saw nothing.”",
      choices: [
        {
          label: "Promise secrecy.",
          result: "“Good.”\n\nShe points to the wall beside her. “You may sit. Quietly.”",
          effects: [
            { type: "meet", character: "kaori" },
            { type: "relationship", character: "kaori", amount: 2 },
            { type: "memory", memory: { id: "kaori_noodle_secret", title: "Classified Noodles", participants: ["player","kaori"], importance: 7, emotion: "trust", tags: ["after_school","secret"], summary: "Discovered Kaori's secret instant-noodle break." } }
          ]
        },
        {
          label: "Offer spare chopsticks.",
          result: "Kaori looks at the chopsticks, then at you.\n\n“You are alarmingly useful.”",
          effects: [
            { type: "meet", character: "kaori" },
            { type: "relationship", character: "kaori", amount: 3 },
            { type: "reputation", amount: 1 },
            { type: "memory", memory: { id: "kaori_noodle_secret", title: "Spare Chopsticks", participants: ["player","kaori"], importance: 7, emotion: "gratitude", tags: ["after_school","secret"], summary: "Helped Kaori during her secret noodle break." } }
          ]
        }
      ]
    }
  ]
};
