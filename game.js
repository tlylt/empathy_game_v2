// PWA Prep 
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then((registration) => {
    console.log("SW Registered!");
    console.log(registration);
  }).catch((error) => {
    console.log("SW registration failed!");
    console.log(error);
  });
}
window.scrollTo(0, 1);

// Game internal state
let state;
let record;
let newState;
let currentStory;

// Character 1
const playerATextNodes = [
  {
    time: 8,
    wealth: 1000,
    profile: [
      1,
      "Player A",
      `<li>You are from a high-income family.</li>
      <li>You live in a landed property.</li>
      <li>Your father is a surgeon and your mother is a partner at a law firm. In addition to your parents, you also live with your retired grandmother, domestic helper, and two dogs.</li>`,
      `<li>You have been playing the violin for the past 12 years and are on your way to earning a diploma.</li>
      <li>You have a large but close social circle, most of whom live in the same area and are the children of your parents’ colleagues.</li>`,
      `<li>Your parents created a trust fund for you when you were born.</li>
      <li>You have an allowance of $1000 per month.</li>`,
    ],
  },
  {
    id: 1,
    text: `It’s time to wake up and start the day. How do you do this?`,
    options: [
      {
        text: `You sleep in till 7:00am because your parents bought a house near school.`,
        next: 1.1,
      },
      {
        text: `You wake up at 6:30am to get a head start on schoolwork.`,
        updateState: { time: 0.5, },
        next: 1.2,
      }
    ]
  },
  {
    id: 1.1,
    text: `By sleeping in till 7:00am,

    Nothing happens! You wake up well-rested and not having taken any extra time out of your day. 
    `,
    options: [
      {
        text: `Continue`,
        next: 2,
      }
    ]
  },
  {
    id: 1.2,
    text: `By waking up at 6:30am,
    
    Your time increases. 
    You are able to get some personal tasks done and clear more time in your schedule for your university application.
    `,
    options: [
      {
        text: `Continue`,
        next: 2,
      }
    ]
  },
  {
    id: 2,
    text: `Breakfast is the most important meal of the day. What do you eat?`,
    options: [
      {
        text: `A full breakfast - pancakes, juice and coffee made fresh by your domestic helper for the entire family.`,
        next: 2.1,
        updateState: { time: -0.25, wealth: -50 },
      },
      {
        text: `Nothing - you’ll pick up a snack on the way to school.`,
        next: 2.2,
        updateState: { wealth: -10 },
      }
    ]
  },
  {
    id: 2.1,
    text: `By eating a full breakfast,

    Your time decreases. 
    Eating a full breakfast takes time but keeps you healthy. Luckily, you did not have to prepare it yourself! 

    Your money decreases.
    Your family needs to pay your domestic helper’s salary, therefore decreasing the amount available for your allowance.
    `,
    options: [
      {
        text: `Continue`,
        next: 3,
      }
    ]
  },
  {
    id: 2.2,
    text: `By eating a smaller breakfast,

    Your money decreases. 
    You have to pay for your morning snack out of pocket, reducing the amount of money you have left. 
    `,
    options: [
      {
        text: `Continue`,
        next: 3,
      }
    ]
  },
  {
    id: 3,
    text: `It’s time to go to school. How do you do this?`,
    options: [
      {
        text: `Your family’s chauffeur drives you to school.`,
        next: 3.1,
        updateState: { time: -0.25, wealth: -80 },

      },
      {
        text: `You take the school bus to school.`,
        next: 3.2,
        updateState: { time: -0.5, wealth: -40 },
      }
    ]
  },
  {
    id: 3.1,
    text: `By being driven to school,

    Your time decreases. 
    It’s a very short drive and therefore you skip most of the morning traffic.

    Your money decreases. 
    Your family needs to pay your chauffeur’s salary, therefore decreasing the amount available for your allowance. 
    `,
    options: [
      {
        text: `Continue`,
        next: 4,
      }
    ]
  },
  {
    id: 3.2,
    text: `By taking the school bus to school,

    Your time decreases. 
    The school bus makes several stops to pick up all the students, so takes a little extra time.

    Your money decreases.
    Your parents paid a fee to the bus chartering company in order to get you a seat on the school bus. 
    `,
    options: [
      {
        text: `Continue`,
        next: 4,
      }
    ]
  },
  {
    id: 4,
    text: `At school, you want to sign up for the orchestra CCA, but they require you to bring your own instrument. What do you do?`,
    options: [
      {
        text: `Ask your parents to call your violin teacher, who will help you choose an instrument to buy.`,
        next: 4.1,
        updateState: { time: -0.5, wealth: -200 },
      },
      {
        text: `Spend some time researching second-hand violins.`,
        next: 4.2,
        updateState: { time: -1, wealth: -80 },
      }
    ]
  },
  {
    id: 4.1,
    text: `By calling your violin teacher,

    Your time decreases.
    Your violin teacher is an expert and quickly helps you choose the best violin available.
    
    Your money decreases. 
    Thankfully, you are able to afford the highest quality violin on offer, but it comes at a price. 
    `,
    options: [
      {
        text: `Continue`,
        next: 5,
      },
    ]
  },
  {
    id: 4.2,
    text: `By researching second-hand violins,

    Your time decreases. 
    You have to compare multiple different instruments in a range of different ways, and it takes some time to make the correct decision.

    Your money decreases.
    You are able to purchase a second-hand violin at a fraction of the price of a new one.
    `,
    options: [
      {
        text: `Continue`,
        next: 5,
      }
    ]
  },
  {
    id: 5,
    text: `The school day is over and you need to spend some time catching up on homework. How do you solve this?`,
    options: [
      {
        text: `Call your private tutor to come over to your house and explain it to you.`,
        next: 5.1,
        updateState: { time: -1.5, wealth: -150 },
      },
      {
        text: `You go to a tuition centre like most of the students in your class.`,
        next: 5.2,
        updateState: { time: -3, wealth: -60 },
      }
    ]
  },
  {
    id: 5.1,
    text: `By calling your private tutor,

    Your time decreases. 
    Though it takes some time for you to eventually understand the work, your tutor is able to work with you on your specific questions without being distracted by other students.

    Your money decreases.
    You have to compensate your private tutor for your time, and at a relatively high price given their qualifications and because they are not teaching anybody else.
    `,
    options: [
      {
        text: `Continue`,
        next: 6,
      }
    ]
  },
  {
    id: 5.2,
    text: `By going to a tuition centre, 

    Your time decreases.
    You spend most of your evening doing homework, as the tutor also has to attend to other students.

    Your money decreases. 
    You have to pay the tuition centre for each session.
    `,
    options: [
      {
        text: `Continue`,
        next: 6,
      }
    ]
  },
  {
    id: 6,
    text: `One of your best friends is celebrating their birthday this weekend. What do you plan to get them?`,
    options: [
      {
        text: `A nice meal at their favourite restaurant, which you will make a reservation for.`,
        next: 6.1,
        updateState: { wealth: -80 },
      },
      {
        text: `A video game they have been wanting to play for a long time.`,
        next: 6.2,
        updateState: { wealth: -60 },
      }
    ]
  },
  {
    id: 6.1,
    text: `By making a restaurant reservation,

    Your time stays the same.
    You are able to get them a gift almost instantly and have more time left for the rest of your tasks.

    Your money decreases.
    You use some of your allowance to make a deposit at the restaurant, as is necessary when placing a reservation. 
    `,
    options: [
      {
        text: `Continue`,
        next: 7,
      }
    ]
  },
  {
    id: 6.2,
    text: `By buying them a video game,

    Your time stays the same.
    You are able to order the gift online and don’t have to visit the store to do so. 
    
    Your money decreases.
    You have to pay for premium shipping in order to get the gift on time, which increases the cost. 
    `,
    options: [
      {
        text: `Continue`,
        next: 7,
      }
    ]
  },
  {
    id: 7,
    text: `You’re finally home. However, your laptop breaks down, meaning you can’t finish your remaining tasks. What do you do?`,
    options: [
      {
        text: `Use the spare desktop computer in the study. It’s slower but it will do the job.`,
        next: 7.1,
        updateState: { time: -2 }
      },
      {
        text: `Pay for emergency laptop repairs.`,
        next: 7.2,
        updateState: { time: -0.5, wealth: -250 },
      }
    ]
  },
  {
    id: 7.1,
    text: `If you use the spare desktop computer,

    Your time decreases. 
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
      }
    ]
  },
  {
    id: 7.2,
    text: `If you pay for emergency laptop repairs,

    Your time decreases.
    You still need to go to the repair shop and wait for them to find and solve the issue.
    
    Your money decreases.
    Getting a laptop repaired quickly costs you more than it would otherwise. 
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
      }
    ]
  },
  {
    id: 8,
    text: `Do you have enough resources (1 hour and $100) to submit your university application?`,
    options: [
      {
        text: `Yes`,
        next: 8.1,
      },
      {
        text: `No`,
        next: 8.2,
      }
    ]
  },
  {
    id: 8.1,
    text: `Congratulations, you have completed your goals.

    However, it is worth keeping in mind that not everybody has the resources to do so. Try repeating this exercise as a different colour and see for yourself.
    `,
    options: [
      {
        Text: `Try Again`,
        next: -1,
      },
      {
        Text: `Quit`,
        next: -1,
      }
    ]
  },
  {
    id: 8.2,
    text: `You have not completed your goals and missed an opportunity for social mobility. Although you can repeat this exercise by playing as the same persona and making different choices, you can also try again as a different persona. Think about whether it is easier or harder for some people to approach these tasks due to the differing levels of time and money available. 
    `,
    options: [
      {
        Text: `Try Again`,
        next: -1,
      },
      {
        Text: `Quit`,
        next: -1,
      }
    ]
  }
]

// Character 2
const playerBTextNodes = [
  {
    time: 8,
    wealth: 500,
    profile: [
      2,
      "Player B",
      `<li>You are from a middle-income family.</li>
      <li>You live in a condominium and share a bedroom.</li>
      <li>Your parents are both managers at an accounting company. In addition to your parents, you live with your younger sibling.</li>`,
      `<li>You have been playing the violin for the last 6 years, ever since your father got promoted and could afford lessons for you.</li>
      <li>You are relatively popular at school.</li>`,
      `<li>You have an allowance of $500 per month.</li>`,
    ],
  },
  {
    id: 1,
    text: `It’s time to wake up and start the day. How do you do this?`,
    options: [
      {
        text: `You share a bedroom with your sibling who starts school before you, and wake up with them at 6:30am.`,
        next: 1.1,
        updateState: { time: -0.5 },
      },
    ]
  },
  {
    id: 1.1,
    text: `By waking up at 6:30am, 

    Your time decreases.
    You have to help your sibling wake up and get ready for school, which reduces the amount of time you have available for other tasks.      
    `,
    options: [
      {
        text: `Continue`,
        next: 2,
      }
    ]
  },
  {
    id: 2,
    text: `Breakfast is the most important meal of the day. What do you eat?`,
    options: [
      {
        text: `Toast and butter.`,
        next: 2.1,
        updateState: { time: -0.25, wealth: -15 },
      },
      {
        text: `Nothing - you’ll pick up a snack on the way to school.`,
        next: 2.2,
        updateState: { wealth: -10 },
      }
    ]
  },
  {
    id: 2.1,
    text: `By making yourself toast and butter,

    Your time decreases. 
    Your money decreases.
    `,
    options: [
      {
        text: `Continue`,
        next: 3,
      }
    ]
  },
  {
    id: 2.2,
    text: `By eating a smaller breakfast,

    Your money decreases. 
    You have to pay for your morning snack out of pocket, reducing the amount of money you have left.     
    `,
    options: [
      {
        text: `Continue`,
        next: 3,
      }
    ]
  },
  {
    id: 3,
    text: `It’s time to go to school. How do you do this?`,
    options: [
      {
        text: `You take the school bus to school.`,
        next: 3.1,
        updateState: { time: -0.5, wealth: -40 },

      },
      {
        text: `You use a concession card to take the MRT and bus to school.`,
        next: 3.2,
        updateState: { time: -1, wealth: -10 },
      }
    ]
  },
  {
    id: 3.1,
    text: `By taking the school bus to school,

    Your time decreases. 
    The school bus makes several stops to pick up all the students, so takes a little extra time.

    Your money decreases.
    Your parents paid a fee to the bus chartering company in order to get you a seat on the school bus.    
    `,
    options: [
      {
        text: `Continue`,
        next: 4,
      }
    ]
  },
  {
    id: 3.2,
    text: `By taking the MRT and bus to school,
    
    Your time decreases.
    You lose time due to having to wait for a train with space, and morning traffic on the bus. 
    
    Your money decreases. 
    `,
    options: [
      {
        text: `Continue`,
        next: 4,
      }
    ]
  },
  {
    id: 4,
    text: `At school, you want to sign up for the orchestra CCA, but they require you to bring your own instrument. What do you do?`,
    options: [
      {
        text: `Rent a violin from a shop near school.`,
        next: 4.1,
        updateState: { time: -1.5, wealth: -40 },
      },
      {
        text: `Spend some time researching second-hand violins.`,
        next: 4.2,
        updateState: { time: -1, wealth: -80 },
      }
    ]
  },
  {
    id: 4.1,
    text: `By renting a violin,

    Your time decreases.
    You still have to travel to and from the rental shop.

    Your money decreases. 
    You have to pay the rental price, but this is cheaper than having to buy a violin.     
    `,
    options: [
      {
        text: `Continue`,
        next: 5,
      },
    ]
  },
  {
    id: 4.2,
    text: `By researching second-hand violins,

    Your time decreases. 
    You have to compare multiple different instruments in a range of different ways, and it takes some time to make the correct decision.

    Your money decreases.
    You are able to purchase a second-hand violin at a fraction of the price of a new one. 
    `,
    options: [
      {
        text: `Continue`,
        next: 5,
      }
    ]
  },
  {
    id: 5,
    text: `The school day is over and you need to spend some time catching up on homework. How do you solve this?`,
    options: [
      {
        text: `You go to a tuition centre like most of the students in your class.`,
        next: 5.1,
        updateState: { time: -3, wealth: -60 },
      },
      {
        text: `You study for a few hours at a cafe.`,
        next: 5.2,
        updateState: { time: -2, wealth: -20 },
      }
    ]
  },
  {
    id: 5.1,
    text: `By going to a tuition centre, 

    Your time decreases.
    You spend most of your evening doing homework, as the tutor also has to attend to other students.

    Your money decreases. 
    You have to pay the tuition centre for each session.
    `,
    options: [
      {
        text: `Continue`,
        next: 6,
      }
    ]
  },
  {
    id: 5.2,
    text: `By going to a cafe,

    Your time decreases. 

    Your money decreases.
    You have to pay for drinks and food at the cafe in order to keep your seat there.`,
    options: [
      {
        text: `Continue`,
        next: 6,
      }
    ]
  },
  {
    id: 6,
    text: `One of your best friends is celebrating their birthday this weekend. What do you plan to get them?`,
    options: [
      {
        text: `A video game they have been wanting to play for a long time.`,
        next: 6.1,
        updateState: { wealth: -60 },
      },
      {
        text: `A book voucher, pooled together with money from your classmates.`,
        next: 6.2,
        updateState: { wealth: -10 },
      }
    ]
  },
  {
    id: 6.1,
    text: `By buying them a video game,

    Your time stays the same.
    You are able to order the gift online and don’t have to visit the store to do so. 

    Your money decreases.
    You have to pay for premium shipping in order to get the gift on time, which increases the cost. 
    `,
    options: [
      {
        text: `Continue`,
        next: 7,
      }
    ]
  },
  {
    id: 6.2,
    text: `By buying them a book voucher,

    Your time stays the same. 
    You are able to order the gift online and don’t have to visit the store to do so.

    Your money decreases.
    You only have to contribute your share of the present.     
    `,
    options: [
      {
        text: `Continue`,
        next: 7,
      }
    ]
  },
  {
    id: 7,
    text: `You’re finally home. However, your laptop breaks down, meaning you can’t finish your remaining tasks. What do you do?`,
    options: [
      {
        text: `Pay for emergency laptop repairs.`,
        next: 7.1,
        updateState: { time: -0.5, wealth: -250 }
      },
      {
        text: `Pay for normal laptop repairs.`,
        next: 7.2,
        updateState: { time: -1.5, wealth: -100 },
      }
    ]
  },
  {
    id: 7.1,
    text: `If you pay for emergency laptop repairs,

    Your time decreases.
    You still need to go to the repair shop and wait for them to find and solve the issue.
    
    Your money decreases.
    Getting a laptop repaired quickly costs you more than it would otherwise.     
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
      }
    ]
  },
  {
    id: 7.2,
    text: `If you pay for normal laptop repairs,

    Your time decreases. 
    The laptop repair specialists are busy working on emergency repairs, and can only consider your case after that.

    Your money decreases.    
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
      }
    ]
  },
  {
    id: 8,
    text: `Do you have enough resources (1 hour and $100) to submit your university application?`,
    options: [
      {
        text: `Yes`,
        next: 8.1,
      },
      {
        text: `No`,
        next: 8.2,
      }
    ]
  },
  {
    id: 8.1,
    text: `Congratulations, you have completed your goals.

    However, it is worth keeping in mind that not everybody has the resources to do so. Try repeating this exercise as a different colour and see for yourself.
    `,
    options: [
      {
        Text: `Try Again`,
        next: -1,
      },
      {
        Text: `Quit`,
        next: -1,
      }
    ]
  },
  {
    id: 8.2,
    text: `You have not completed your goals and missed an opportunity for social mobility. Although you can repeat this exercise by playing as the same persona and making different choices, you can also try again as a different persona. Think about whether it is easier or harder for some people to approach these tasks due to the differing levels of time and money available. 
    `,
    options: [
      {
        Text: `Try Again`,
        next: -1,
      },
      {
        Text: `Quit`,
        next: -1,
      }
    ]
  }
]

// Character 1
const playerCTextNodes = [
  {
    time: 8,
    wealth: 100,
    profile: [
      3,
      "Player C",
      `<li>You are from a low-income family.</li>
      <li>You live in a rental one-room flat.</li>
      <li>Your father is a bus driver and your mother is a cleaner. In addition to your parents, you live with your 2 grandparents (who are also cleaners), and 2 younger siblings.</li>`,
      `<li>You rarely have time for hobbies in between studies and work.</li>
      <li>You have trouble making friends as you do not want to tell them about your situation.</li>`,
      `<li>You work a part-time job at a fast food restaurant and currently have $100 saved up.</li>`,
    ],
  },
  {
    id: 1,
    text: `It’s time to wake up and start the day. How do you do this?`,
    options: [
      {
        text: `Your parents worked late last night, so you take care of morning chores by waking up at 5:30am.`,
        next: 1.1,
      },
    ]
  },
  {
    id: 1.1,
    text: `By waking up at 5:30am,

    Your time decreases.
    Although you wake up early, you have to spend this time doing chores and therefore have less time to do your own tasks.
    `,
    options: [
      {
        text: `Continue`,
        next: 2,
        updateState: { time: -1.5 }
      }
    ]
  },
  {
    id: 2,
    text: `Breakfast is the most important meal of the day. What do you eat?`,
    options: [
      {
        text: `Leftovers - you make lunch for your parents to save money, and will eat whatever remains.`,
        next: 2.1,
        updateState: { time: -1 },
      },
      {
        text: `Subsidised meals at school.`,
        next: 2.2,
        updateState: { wealth: -5, time: -0.5 },
      }
    ]
  },
  {
    id: 2.1,
    text: `By making lunch and eating leftovers,

    Your time decreases.
    You have to cook and pack the food, and clean up the kitchen. 
    `,
    options: [
      {
        text: `Continue`,
        next: 3,
      }
    ]
  },
  {
    id: 2.2,
    text: `By eating subsidised meals at school,

    Your time decreases.
    You have to get to school early in order to receive food before it runs out.

    Your money decreases. 
    Although meals at school are subsidised, they are not entirely free.    
    `,
    options: [
      {
        text: `Continue`,
        next: 3,
      }
    ]
  },
  {
    id: 3,
    text: `It’s time to go to school. How do you do this?`,
    options: [
      {
        text: `You use a concession card to take the MRT and bus to school.`,
        next: 3.1,
        updateState: { time: -1, wealth: -10 },

      },
      {
        text: `You walk to school.`,
        next: 3.2,
        updateState: { time: -1.5 },
      }
    ]
  },
  {
    id: 3.1,
    text: `By taking the MRT and bus to school,

    Your time decreases. 
    You lose time due to having to wait for a train with space, and enduring morning traffic on the bus. 

    Your money decreases.     
    `,
    options: [
      {
        text: `Continue`,
        next: 4,
      }
    ]
  },
  {
    id: 3.2,
    text: `By walking to school,

    Your time decreases. 
    `,
    options: [
      {
        text: `Continue`,
        next: 4,
      }
    ]
  },
  {
    id: 4,
    text: `At school, you want to sign up for the orchestra CCA, but they require you to bring your own instrument. What do you do?`,
    options: [
      {
        text: `Reach out to a charity that donates used instruments to low-income students.`,
        next: 4.1,
        updateState: { time: -2 },
      },
      {
        text: `Rent a violin from a shop near school.`,
        next: 4.2,
        updateState: { time: -1.5, wealth: -40 },
      }
    ]
  },
  {
    id: 4.1,
    text: `By reaching out to a charity,

    Your time decreases.
    You need to fill out a considerable amount of paperwork and then maintain communication with a charity officer to process your application.    
    `,
    options: [
      {
        text: `Continue`,
        next: 5,
      },
    ]
  },
  {
    id: 4.2,
    text: `By renting a violin,

    Your time decreases.
    You still have to travel to and from the rental shop.

    Your money decreases. 
    You have to pay the rental price, but this is cheaper than having to buy a violin. 
    `,
    options: [
      {
        text: `Continue`,
        next: 5,
      }
    ]
  },
  {
    id: 5,
    text: `The school day is over and you need to spend some time catching up on homework. How do you solve this?`,
    options: [
      {
        text: `Study at the local library.`,
        next: 5.1,
        updateState: { time: -2, wealth: -5 },
      },
      {
        text: `Study at home.`,
        next: 5.2,
        updateState: { time: -3, wealth: -60 },
      }
    ]
  },
  {
    id: 5.1,
    text: `By calling your private tutor,

    Your time decreases. 
    Though it takes some time for you to eventually understand the work, your tutor is able to work with you on your specific questions without being distracted by other students.

    Your money decreases.
    You have to compensate your private tutor for your time, and at a relatively high price given their qualifications and because they are not teaching anybody else.
    `,
    options: [
      {
        text: `Continue`,
        next: 6,
      }
    ]
  },
  {
    id: 5.2,
    text: `By going to a tuition centre, 

    Your time decreases.
    You spend most of your evening doing homework, as the tutor also has to attend to other students.

    Your money decreases. 
    You have to pay the tuition centre for each session.
    `,
    options: [
      {
        text: `Continue`,
        next: 6,
      }
    ]
  },
  {
    id: 6,
    text: `One of your best friends is celebrating their birthday this weekend. What do you plan to get them?`,
    options: [
      {
        text: `A nice meal at their favourite restaurant, which you will make a reservation for.`,
        next: 6.1,
        updateState: { wealth: -80 },
      },
      {
        text: `A video game they have been wanting to play for a long time.`,
        next: 6.2,
        updateState: { wealth: -60 },
      }
    ]
  },
  {
    id: 6.1,
    text: `By making a restaurant reservation,

    Your time stays the same.
    You are able to get them a gift almost instantly and have more time left for the rest of your tasks.

    Your money decreases.
    You use some of your allowance to make a deposit at the restaurant, as is necessary when placing a reservation. 
    `,
    options: [
      {
        text: `Continue`,
        next: 7,
      }
    ]
  },
  {
    id: 6.2,
    text: `By buying them a video game,

    Your time stays the same.
    You are able to order the gift online and don’t have to visit the store to do so. 
    
    Your money decreases.
    You have to pay for premium shipping in order to get the gift on time, which increases the cost. 
    `,
    options: [
      {
        text: `Continue`,
        next: 7,
      }
    ]
  },
  {
    id: 7,
    text: `You’re finally home. However, your laptop breaks down, meaning you can’t finish your remaining tasks. What do you do?`,
    options: [
      {
        text: `Use the spare desktop computer in the study. It’s slower but it will do the job.`,
        next: 7.1,
        updateState: { time: -2 }
      },
      {
        text: `Pay for emergency laptop repairs.`,
        next: 7.2,
        updateState: { time: -0.5, wealth: -250 },
      }
    ]
  },
  {
    id: 7.1,
    text: `If you use the spare desktop computer,

    Your time decreases. 
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
      }
    ]
  },
  {
    id: 7.2,
    text: `If you pay for emergency laptop repairs,

    Your time decreases.
    You still need to go to the repair shop and wait for them to find and solve the issue.
    
    Your money decreases.
    Getting a laptop repaired quickly costs you more than it would otherwise. 
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
      }
    ]
  },
  {
    id: 8,
    text: `Do you have enough resources (1 hour and $100) to submit your university application?`,
    options: [
      {
        text: `Yes`,
        next: 8.1,
      },
      {
        text: `No`,
        next: 8.2,
      }
    ]
  },
  {
    id: 8.1,
    text: `Congratulations, you have completed your goals.

    However, it is worth keeping in mind that not everybody has the resources to do so. Try repeating this exercise as a different colour and see for yourself.
    `,
    options: [
      {
        Text: `Try Again`,
        next: -1,
      },
      {
        Text: `Quit`,
        next: -1,
      }
    ]
  },
  {
    id: 8.2,
    text: `You have not completed your goals and missed an opportunity for social mobility. Although you can repeat this exercise by playing as the same persona and making different choices, you can also try again as a different persona. Think about whether it is easier or harder for some people to approach these tasks due to the differing levels of time and money available. 
    `,
    options: [
      {
        Text: `Try Again`,
        next: -1,
      },
      {
        Text: `Quit`,
        next: -1,
      }
    ]
  }
]

// Terry
const TerryTextNodes = [
  {
    health: 55,
    wealth: 1000,
    social: 40,
    cpf: 1000,
    allowance: 900,
    expense: 900,
    job: 0,
    date: "10 April",
    delay: false,
    covid: false,
    police: false,
    family: false,
    profile: [
      1,
      "Terry Ang Chee Boon, 73",
      `<li>Retired</li>`,
      `<li>Lives with wife</li>
      <li>Has 2 children who provide a monthly allowance of $900</li>`,
      `<li>
      Lost touch with old friends, acquaintance with people in his
      neighbourhood
    </li>
    <li>Spends most of his time with his wife</li>`,
      ` <li>Early-onset dementia</li>
      <li>Gout</li>`,
      `<li>$1900 income: $1000 CPF payout, $900 allowance</li>
      <li>
        $900 expenses(including food, utilities, treatment,
        entertainment)
      </li>`
    ],
  },
  {
    id: 1,
    text: `You went out of the house and forgot to wear your mask. 

    Along the way, you realise that everyone is staring at you, but you are not sure why. 
    Suddenly, someone comes up to you and says, "Hello uncle, you are not wearing your mask." 
    It takes about 30 minutes of explaining before you recall why you need to wear a mask.
    
    You can either:`,
    options: [
      {
        text: "Walk home and take your mask",
        updateState: { health: -5, covid: true, police: true },
        next: 1.1,
      },
      {
        text: "Go to the nearest convenience store and buy a mask",
        updateState: { health: -5, wealth: -25 },
        next: 1.2,
      },
    ],
  },
  {
    id: 1.1,
    text: `By walking home to take your mask,

    Your health points decrease.

    Talking to the person for 30 minutes unprotected and walking home without a mask automatically makes you more vulnerable to the virus. 
    `,
    options: [
      {
        text: "Continue",
        next: 2,
        updateState: { date: "26 April" },
      },
    ],
  },
  {
    id: 1.2,
    text: `By going to the nearest convenience store to buy a mask,

    Your health points decrease.
    Talking to the person for 30 minutes unprotected and walking to the nearest convenience store without a mask automatically makes you more vulnerable to the virus.
    
    Your wealth decreases.
    The store you go to only sells one type of disposable masks (50 pieces). You had to spend your limited finances on buying these masks.
    `,
    options: [
      {
        text: "Continue",
        next: 2,
        updateState: { date: "26 April" },
      },
    ],
  },
  {
    id: 2,
    text: `Your children inform you that they may be facing salary cuts at work.
    
    They inform you that they will not be able to give you as much allowance because they are struggling to cope with the financial situation as well.
    
    You can either:`,
    options: [
      {
        text: `Depend on your savings and CPF retirement payouts. You will have a 
        total of $700 per month as compared to the previous $1000`,
        updateState: { allowance: -300 },
        next: 2.1,
      },
      {
        text: `Go and find a job.`,
        updateState: { health: -15, allowance: -300, job: 200, delay: true },
        next: 2.2,
      },
    ],
  },

  {
    id: 2.1,
    text: `By depending on your savings and CPF payouts,

    Your payday value will decrease from here on.`,
    options: [
      {
        text: "Continue",
        next: 2.3,
        updateState: { payday: true, date: "1 May" },
      },
    ],
  },
  {
    id: 2.2,
    text: `By going out to find a job,

    Your health points decrease.
    With increased exposure to the virus in public spaces coupled with your age, you are more vulnerable to the virus.

    Your pay day value will increase from here on. 
    Since you found a job, you are able to earn a greater income.
    `,
    options: [
      {
        text: "Continue",
        next: 2.3,
        updateState: { payday: true, date: "1 May" },
      },
    ],
  },
  {
    id: 2.3,
    text: `It's Pay Day!`,
    options: [
      {
        text: "Continue",
        updateState: { date: "5 May" },
        next: 3,
      },
    ],
  },
  {
    id: 3,
    text: `Due to regulations, such as Circuit Breaker, you've been cooped up at home.

    Not only do you miss your friends, but your dementia is deteriorating because of the lack of cognitive exercise.
    
    You can either:`,
    options: [
      {
        text: `Go out and meet your friends to play mahjong`,
        updateState: { social: 5, health: -10, covid: true, police: true, family: true },
        next: 3.1,
      },
      {
        text: `Stay at home`,
        updateState: { social: -10 },
        next: 3.2,
      },
    ],
  },
  {
    id: 3.1,
    text: `By going out to meet your friends,
    
    Your social points increase.
    You are able to interact with more people.

    Your health points decrease.
    Although meeting your friends is beneficial to your mental health and dementia, your old age causes you to be more vulnerable to the virus when you go out. Your health is more greatly affected by COVID-19.
    `,
    options: [
      {
        text: `Continue`,
        next: 4,
        updateState: { date: "18 May" },
      },
    ],
  },
  {
    id: 3.2,
    text: `By staying home,

    Your social points decrease.
    You missed the chance to meet with your friends.
    `,
    options: [
      {
        text: "Continue",
        next: 4,
        updateState: { date: "18 May" },
      },
    ],
  },
  {
    id: 4,
    text: `In order to meet up with your friends more frequently in a legal manner, you think
    about using web conferencing platforms such as Skype or Zoom. 
    
    But you have no idea how to use these platforms because you are digitally illiterate.
    
    You can either:`,
    options: [
      {
        text: `Actively find ways to learn how to use the platforms, even though it is very difficult for you to understand them and you learn after a long time.`,
        updateState: { social: 15, family: true },
        next: 4.1,
      },
      {
        text: `Dismiss the idea of using these platforms`,
        updateState: { social: -10, family: true },
        next: 4.2,
      },
    ],
  },
  {
    id: 4.1,
    text: `By actively learning how to use these platforms,

    Your social points increase.
    After learning how to use the computer, you will be able to connect with your friends online.
    `,
    options: [
      {
        text: "Continue",
        next: 4.3,
        updateState: { payday: true, date: "1 June" },
      },
    ],
  },
  {
    id: 4.2,
    text: `By dismissing the idea of using these platforms,

    Your social points decrease.
    You are unable to connect with your friends.    
    `,
    options: [
      {
        text: "Continue",
        next: 4.3,
        updateState: { payday: true, date: "1 June" },
      },
    ],
  },
  {
    id: 4.3,
    text: `It's Pay Day!`,
    options: [
      {
        text: "Continue",
        next: 5,
        updateState: { date: "13 June" },
      },
    ],
  },
  {
    id: 5,
    text: `Circuit breaker has now ended. 
    
    To compensate for the increase in cost of living and cut in allowance, you decide to go and look for a job because your wife needs the money because she got into an accident. (disclaimer: if you currently have a job, you are taking on a second job) After multiple job applications, you are struggling to find a suitable job. The only job that is available requires you to clean at an MRT station at peak hours.
    
    You can either:`,
    options: [
      {
        text: `Continue applying until you get a less-risky job`,
        updateState: { wealth: -400, health: -7 },
        next: 5.1,
      },
      {
        text: `Apply for a job as a cleaner`,
        updateState: { wealth: 800, health: -15, covid: true },
        next: 5.2,
      },
    ],
  },
  {
    id: 5.1,
    text: `By continuing to apply for a less-risky job, 
    
    Your wealth points decrease.
    Your savings continue to deplete as your expenses increase.

    Your health points decrease.
    As you work in a less-risky job, your exposure to the virus is less, but still present. 
    `,
    options: [
      {
        text: `Continue`,
        next: -1,
      },
    ],
  },
  {
    id: 5.2,
    text: `By choosing to apply for a job as a cleaner,
    
    Your wealth points increase.
    The temporary job is able to cover the increase in costs of living.

    Your health points decrease.
    The job increases the exposure risk to the virus.
    `,
    options: [
      {
        text: "Continue",
        next: -1,
      },
    ],
  },
];


// utility
const toggleHide = (...elements) => {
  elements.forEach((element) => {
    if (element.classList.contains("hide")) {
      element.classList.add("in");
      element.classList.remove("hide");
    } else {
      element.classList.add("hide");
    }
  });
}

const toggleHideWithoutIn = function (...elements) {
  elements.forEach((element) => {
    if (element.classList.contains("hide")) {
      element.classList.remove("hide");
    } else {
      element.classList.add("hide");
    }
  })
}

// background music
const footerElement = document.getElementById("footer");
const initAudioPlayer = function () {

  const soundOnBtn = document.getElementById("soundOnBtn");
  const soundOffBtn = document.getElementById("soundOffBtn");
  const audio = new Audio();
  audio.volume = 0.05;
  audio.src = "assets/audio/bells-tibetan-daniel_simon.mp3";
  audio.loop = true;
  audio.muted = true;

  const toggle = () => {
    if (audio.muted) {
      audio.play();
      toggleHideWithoutIn(soundOnBtn, soundOffBtn);
    } else {
      toggleHideWithoutIn(soundOnBtn, soundOffBtn);
    }
    audio.muted = !audio.muted;
  }
  // Add Event Handling
  soundOnBtn.addEventListener("click", toggle);
  soundOffBtn.addEventListener("click", toggle);


}
window.addEventListener("load", initAudioPlayer);

// header
const headerElement = document.getElementById("header");

// game start elements
const welcomeElement = document.getElementById("welcome");
const welcomeBtnElement = document.getElementById("welcome-btn");
const backgroundElement = document.getElementById("background");

// intro elements
const intro1Element = document.getElementById("intro1");
const intro1BtnElement = document.getElementById("intro1-btn");
const intro2Element = document.getElementById("intro2");
const intro2BtnElement = document.getElementById("intro2-btn");
const intro3Element = document.getElementById("intro3");

// game end elements
const creditElement = document.getElementById("credit");
const creditBtnElement = document.getElementById("credit-btn");
const end1Element = document.getElementById("end1");
const end1BtnElement = document.getElementById("end1-btn");
const end2Element = document.getElementById("end2");
const end2BtnElement = document.getElementById("end2-btn");
const end3Element = document.getElementById("end3");
const end3BtnElement = document.getElementById("end3-btn");
const end4BtnElement = document.getElementById("end4-btn");
const gameoverElement = document.getElementById("gameover");
const gameoverBtnElement = document.getElementById("gameover-btn");

// button interactions
welcomeBtnElement.onclick = () => {
  welcomeElement.classList.add("out");
  setTimeout(() => toggleHide(backgroundElement, welcomeElement, intro1Element), 1000);
};
intro1BtnElement.onclick = () => toggleHide(intro1Element, intro2Element);
intro2BtnElement.onclick = () => toggleHide(intro2Element, intro3Element);
end1BtnElement.onclick = () => toggleHide(end1Element, end2Element);
end2BtnElement.onclick = () => toggleHide(end2Element, end3Element);
creditBtnElement.onclick = () => toggleHide(end3Element, creditElement);
end3BtnElement.onclick = () => restart();
end4BtnElement.onclick = () => restart();
gameoverBtnElement.onclick = () => {
  toggleHide(gameoverElement);
  restart();
};

const toggleProfileBtn = function () {
  const btn = document.getElementById("profile");
  const svg = btn.querySelector("svg"); // svg.style.fill = "blanchedalmond";
  const currProfile = document.getElementById("currProfile");

  // fill in current character info
  const [{ profile: [currId] }] = currentStory;
  // currProfile.classList.add(`img-char${currId}`);
  [{ profile: [, currProfile.querySelector("h2").innerText] }] = currentStory;
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < 6; i++) {
    // eslint-disable-next-line prefer-destructuring
    currProfile.querySelector(`ul:nth-of-type(${i})`).innerHTML = currentStory[0]["profile"][i + 1];
  }
  if (svg.classList.contains("hide")) {
    svg.classList.remove("hide");
    btn.onclick = null;
    btn.classList.remove(`img-char${currId}`);
    btn.removeAttribute("style");
  } else {
    svg.classList.add("hide");
    btn.classList.add(`img-char${currId}`);
    btn.style.height = "4rem";
    btn.style.width = "4rem";
    btn.style.backgroundSize = "contain";
    btn.style.backgroundPosition = "center";
    btn.onclick = (e) => {
      toggleHideWithoutIn(currProfile);
      toggleHide(contentElement, headerElement);
    }
  }
}

// character elements
const initCharacters = function () {
  const charShortNames = ["playerA", "playerB", "playerC"];
  const numberOfChar = 3;
  Array.from(Array(numberOfChar), (_, i) => i + 1).forEach(
    (item) => {
      const element = document.getElementById(`char${item}`);
      const btnElement = document.getElementById(`char${item}-btn`);
      btnElement.onclick = () => {
        toggleProfileBtn();
        startGame();
        toggleHide(element, contentElement);
      };

      // for slideshow of characters
      const imgElement = document.querySelector(`.slideshow-container > div:nth-child(${item}) > img`);
      imgElement.onclick = () => {
        toggleHide(intro3Element);
        element.classList.add("in");
        toggleHide(element);
        setInitialGameState(charShortNames[item - 1]);
      }
    }
  )
}

initCharacters();


// display elements
const elements = [
  headerElement,
  intro1Element,
  intro2Element,
  creditElement,
  end1Element,
  end2Element,
  end3Element,
];

// Story info
const storyInfo = {
  playerA: playerATextNodes,
  playerB: playerBTextNodes,
  playerC: playerCTextNodes,
};

// game logic elements
const contentElement = document.getElementById("content");
const contentTextElement = document.getElementById("content-text");
const contentOptionsElement = document.getElementById("content-options");

// game Display Meters
const wealthMeter = document.getElementById("wealth-meter");
const timeMeter = document.getElementById("time-meter");
const meterList = {
  wealth: wealthMeter,
  time: timeMeter,
};

const setInitialGameState = function (characterName) {
  ({ [characterName]: currentStory } = storyInfo);
  ([state] = currentStory);
  record = [{ ...state }];
}
const startGame = function () {
  headerElement.classList.remove("hide");
  updateMeters();
  showTextNode(1);
}

const showTextNode = function (textNodeIndex) {
  const textNode = currentStory.find(
    (textNode) => textNode.id === textNodeIndex
  );
  ({ text: contentTextElement.innerText } = textNode);

  while (contentOptionsElement.firstChild) {
    // remove all previous options
    contentOptionsElement.removeChild(contentOptionsElement.firstChild);
  }
  // create new options
  textNode.options.forEach((option) => {
    const button = document.createElement("button");
    ({ text: button.innerText } = option);
    button.classList.add("btn");
    button.classList.add("option-btn");
    button.classList.add("in");
    button.onclick = () => selectOption(option, false);
    contentOptionsElement.appendChild(button);
  });
}

const goEndScene = function () {
  toggleProfileBtn();
  toggleHide(end1Element, contentElement);
}

const goGameOverScene = function () {
  toggleProfileBtn();
  toggleHide(gameoverElement, contentElement);
}

const updateAmount = function (state, meter, amount) {
  state[meter] += amount;
}

const copyValue = function (state, meter, value) {
  state[meter] = value;
}
const getRandomInt = function (min, max) {
  minInt = Math.ceil(min);
  maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt) + minInt); //The maximum is exclusive and the minimum is inclusive
}
update = {
  health: (state, meter, amount) => {
    state[meter] = Math.min(100, state[meter] + amount);
  },
  time: updateAmount,
  wealth: updateAmount,
};

const updateMeters = function () {
  const { [record.length - 1]: latest } = record;
  const list = ["wealth", "time"];
  list.forEach((meter) => {
    const { [meter]: element } = meterList;
    if (element.innerText !== latest[meter].toString()) {
      if (meter === "wealth") {
        document.getElementById(meter).classList.add("vibrate-1");
        setTimeout(
          () => document.getElementById(meter).classList.remove("vibrate-1"),
          400
        );
      }
      setTimeout(() => element.classList.add("in"), 500);
      setTimeout(() => ({ [meter]: element.innerText } = latest), 500);
      setTimeout(() => element.classList.remove("in"), 2000);
    }
  });
}


const selectOption = function (option) {
  newState = { ...record[record.length - 1] };
  const { "next": nextTextNodeId } = option;
  if (nextTextNodeId <= 0) {
    return goEndScene();
  }
  if (option.updateState) {
    // an update is required
    for (const [currItem, currValue] of Object.entries(option.updateState)) {
      update[currItem](newState, currItem, currValue);
    }
  }

  record.push(newState);
  showTextNode(nextTextNodeId);
  updateMeters();
}

const resetGameState = function () {
  state = null;
  record = null;
  newState = null;
  currentStory = null;
}

const restart = function () {
  resetGameState();
  // reset welcome screen
  welcomeElement.classList.remove("out");
  toggleHide(welcomeElement, backgroundElement);
  welcomeElement.classList.remove("in");
  // settle class list, hide for the elements in the list
  elements.forEach((e) => {
    e.classList.remove("in");
    e.classList.remove("out");

    if (!e.classList.contains("hide")) {
      e.classList.add("hide");
    }
  });
}

// character slideshow
let slideIndex = 1;
const showSlides = function (n) {
  let i;
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    ({ "length": slideIndex } = slides);
  }
  // eslint-disable-next-line no-plusplus
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  // eslint-disable-next-line no-plusplus
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
  dots[slideIndex - 1].className += " active";
}

// Next/previous controls
const plusSlides = function (n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
const currentSlide = function (n) {
  showSlides((slideIndex = n));
}
// carousel
// start with a random character
showSlides(slideIndex);
currentSlide(getRandomInt(1, 4));