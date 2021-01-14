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
// Full Screen
const fullscreenHintElement = document.getElementById('fullscreenHint');
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      fullscreenHintElement.classList.add('hide');
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    }
    else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen();
    }
    else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }

  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
    else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}
document.addEventListener("keypress", (e) => {
  if (e.key === 'Enter') {
    toggleFullScreen();
  }
}, false);
// Game internal state
let state;
let record;
let newState;
let currentStory;

// Character 1
const playerATextNodes = [
  {
    time: 8.0,
    wealth: 1000,
    profile: [
      1,
      "Arthur",
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
    text: `<i>By sleeping in till 7:00am,</i><br/>

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
    text: `<i>By waking up at 6:30am,</i><br/>
    
    <bold>Your time increases.</bold>
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
    text: `<i>By eating a full breakfast,</i><br/>

    <bold>Your time slightly decreases.</bold>
    Eating a full breakfast takes time but keeps you healthy. Luckily, you did not have to prepare it yourself!<br/><br/>  

    <bold>Your money decreases.</bold>
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
    text: `<i>By eating a smaller breakfast,</i><br/>

    <bold>Your money slightly decreases.</bold> 
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
    text: `<i>By being driven to school,</i><br/>

    <bold>Your time slightly decreases.</bold> 
    It’s a very short drive and therefore you skip most of the morning traffic.<br/><br/>

    <bold>Your money decreases.</bold> 
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
    text: `<i>By taking the school bus to school,</i><br/>

    <bold>Your time decreases.</bold> 
    The school bus makes several stops to pick up all the students, so takes a little extra time.<br/><br/>

    <bold>Your money decreases.</bold>
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
        updateState: { wealth: -200 },
      },
      {
        text: `Spend some time researching second-hand violins.`,
        next: 4.2,
        updateState: { time: -0.5, wealth: -80 },
      }
    ]
  },
  {
    id: 4.1,
    text: `<i>By calling your violin teacher,</i><br/>

    <bold>Your time stays the same.</bold>
    Your violin teacher is an expert and chooses the instrument on your behalf, taking up on time of your own.<br/><br/>
    
    <bold>Your money sharply decreases.</bold> 
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
    text: `<i>By researching second-hand violins,</i><br/>

    <bold>Your time decreases.</bold> 
    You have to compare multiple different instruments in a range of different ways, and it takes some time to make the correct decision.<br/><br/>

    <bold>Your money decreases.</bold>
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
    text: `<i>By calling your private tutor,</i><br/>

    <bold>Your time decreases.</bold> 
    Though it takes some time for you to eventually understand the work, your tutor is able to work with you on your specific questions without being distracted by other students.<br/><br/>

    <bold>Your money sharply decreases.</bold>
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
    text: `<i>By going to a tuition centre,</i><br/>

    <bold>Your time significantly decreases.</bold>
    You spend most of your evening doing homework, as the tutor also has to attend to other students.<br/><br/>

    <bold>Your money decreases.</bold> 
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
    text: `<i>By making a restaurant reservation,</i><br/>

    <bold>Your time stays the same.</bold>
    You are able to get them a gift almost instantly and have more time left for the rest of your tasks.<br/><br/>

    <bold>Your money decreases.</bold>
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
    text: `<i>By buying them a video game,</i><br/>

    <bold>Your time stays the same.</bold>
    You are able to order the gift online and don’t have to visit the store to do so.<br/><br/> 
    
    <bold>Your money decreases.</bold>
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
    text: `<i>If you use the spare desktop computer,</i><br/>

    <bold>Your time significantly decreases.</bold> 
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
        done: true,
      }
    ]
  },
  {
    id: 7.2,
    text: `<i>If you pay for emergency laptop repairs,</i><br/>

    <bold>Your time decreases.</bold>
    You still need to go to the repair shop and wait for them to find and solve the issue.<br/><br/>
    
    <bold>Your money sharply decreases.</bold>
    Getting a laptop repaired quickly costs you more than it would otherwise. 
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
        done: true,
      }
    ]
  },
  {
    id: 8,
    text: `Do you have enough resources (0.50 hours and $100) to submit your university application?`,
    options: [
      {
        text: `Yes`,
        next: "win",
      },
      {
        text: `No`,
        next: "lose",
      }
    ]
  },
  {
    id: 8.1,
    text: `Congratulations, you have completed your goals.

    However, it is worth keeping in mind that not everybody has the resources to do so. Try repeating this exercise as a different player and see for yourself.
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
    time: 8.0,
    wealth: 500,
    profile: [
      2,
      "Belinda",
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
    text: `<i>By waking up at 6:30am,</i><br/> 

    <bold>Your time decreases.</bold>
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
    text: `<i>By making yourself toast and butter,</i><br/>

    <bold>Your time slightly decreases.</bold><br/>
    <bold>Your money decreases.</bold>
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
    text: `<i>By eating a smaller breakfast,</i><br/>

    <bold>Your time stays the same.</bold><br/>
    <bold>Your money decreases.</bold> 
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
        updateState: { time: -0.75, wealth: -10 },
      }
    ]
  },
  {
    id: 3.1,
    text: `<i>By taking the school bus to school,</i><br/>

    <bold>Your time decreases.</bold> 
    The school bus makes several stops to pick up all the students, so takes a little extra time.<br/><br/>

    <bold>Your money decreases.</bold>
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
    text: `<i>By taking the MRT and bus to school,</i><br/>
    
    <bold>Your time decreases.</bold>
    You lose time due to having to wait for a train with space, and morning traffic on the bus.<br/><br/> 
    
    <bold>Your money slightly decreases.</bold> 
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
        updateState: { time: -1, wealth: -40 },
      },
      {
        text: `Spend some time researching second-hand violins.`,
        next: 4.2,
        updateState: { time: -0.5, wealth: -80 },
      }
    ]
  },
  {
    id: 4.1,
    text: `<i>By renting a violin,</i><br/>

    <bold>Your time decreases.</bold>
    You still have to travel to and from the rental shop.<br/><br/>

    <bold>Your money decreases.</bold> 
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
    text: `<i>By researching second-hand violins,</i><br/>

    <bold>Your time decreases.</bold> 
    You have to compare multiple different instruments in a range of different ways, and it takes some time to make the correct decision.<br/><br/>

    <bold>Your money decreases.</bold>
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
        updateState: { time: -1, wealth: -20 },
      }
    ]
  },
  {
    id: 5.1,
    text: `<i>By going to a tuition centre,</i><br/> 

    <bold>Your time significantly decreases.</bold>
    You spend most of your evening doing homework, as the tutor also has to attend to other students.<br/><br/>

    <bold>Your money decreases.</bold> 
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
    text: `<i>By going to a cafe,</i><br/>

    <bold>Your time decreases.</bold><br/>

    <bold>Your money decreases.</bold>
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
    text: `<i>By buying them a video game,</i><br/>

    <bold>Your time stays the same.</bold>
    You are able to order the gift online and don’t have to visit the store to do so.<br/><br/> 

    <bold>Your money decreases.</bold>
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
    text: `<i>By buying them a book voucher,</i><br/>

    <bold>Your time stays the same.</bold> 
    You are able to order the gift online and don’t have to visit the store to do so.<br/><br/>

    <bold>Your money decreases.</bold>
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
    text: `<i>If you pay for emergency laptop repairs,</i><br/>

    <bold>Your time decreases.</bold>
    You still need to go to the repair shop and wait for them to find and solve the issue.<br/><br/>
    
    <bold>Your money sharply decreases.</bold>
    Getting a laptop repaired quickly costs you more than it would otherwise.     
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
        done: true,
      }
    ]
  },
  {
    id: 7.2,
    text: `<i>If you pay for normal laptop repairs,</i><br/>

    <bold>Your time decreases.</bold> 
    The laptop repair specialists are busy working on emergency repairs, and can only consider your case after that.<br/><br/>

    <bold>Your money decreases.</bold>    
    `,
    options: [
      {
        text: `Continue`,
        next: 8,
        done: true,
      }
    ]
  },
  {
    id: 8,
    text: `Do you have enough resources (0.50 hours and $100) to submit your university application?`,
    options: [
      {
        text: `Yes`,
        next: "win",
      },
      {
        text: `No`,
        next: "lose",
      }
    ]
  },
  {
    id: 8.1,
    text: `Congratulations, you have completed your goals.

    However, it is worth keeping in mind that not everybody has the resources to do so. Try repeating this exercise as a different player and see for yourself.
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

// Character 3
const playerCTextNodes = [
  {
    time: 8.0,
    wealth: 100,
    profile: [
      3,
      "Curtis",
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
        text: `Your parents worked late last night, so you take care of morning chores by waking up at 6:00am.`,
        next: 1.1,
        updateState: { time: -1 }
      },
    ]
  },
  {
    id: 1.1,
    text: `<i>By waking up at 6:00am,</i><br/>

    <bold>Your time decreases.</bold>
    Although you wake up early, you have to spend this time doing chores and therefore have less time to do your own tasks.
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
        text: `Leftovers - you make lunch for your parents to save money, and will eat whatever remains.`,
        next: 2.1,
        updateState: { time: -1 },
      },
      {
        text: `Subsidised meals at school.`,
        next: 2.2,
        updateState: { wealth: -5, time: -0.25 },
      }
    ]
  },
  {
    id: 2.1,
    text: `<i>By making lunch and eating leftovers,</i><br/>

    <bold>Your time significantly decreases.</bold>
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
    text: `<i>By eating subsidised meals at school,</i><br/>

    <bold>Your time decreases.</bold>
    You have to get to school early in order to receive food before it runs out.<br/><br/>

    <bold>Your money slightly decreases.</bold> 
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
        updateState: { time: -0.75, wealth: -10 },

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
    text: `<i>By taking the MRT and bus to school,</i><br/>

    <bold>Your time decreases.</bold> 
    You lose time due to having to wait for a train with space, and enduring morning traffic on the bus.<br/><br/>

    <bold>Your money slightly decreases.</bold>     
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
    text: `<i>By walking to school,</i><br/>

    <bold>Your time significantly decreases.</bold> 
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
        updateState: { time: -1, wealth: -40 },
      }
    ]
  },
  {
    id: 4.1,
    text: `<i>By reaching out to a charity,</i><br/>

    <bold>Your time significantly decreases.</bold>
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
    text: `<i>By renting a violin,</i><br/>

    <bold>Your time decreases.</bold>
    You still have to travel to and from the rental shop.<br/><br/>

    <bold>Your money decreases.</bold> 
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
        updateState: { time: -1.5, wealth: -5 },
      },
      {
        text: `Study at home.`,
        next: 5.2,
      }
    ]
  },
  {
    id: 5.1,
    text: `<i>By studying at the local library,</i><br/>

    <bold>Your time decreases.</bold>
    The library is crowded at this time of day and you need to find a seat and the books you require.<br/><br/>

    <bold>Your money slightly decreases.</bold>
    You have some overdue fines and need to pay them off before being allowed to borrow new books.
    `,
    options: [
      {
        text: `Continue`,
        next: 7,
      }
    ]
  },
  {
    id: 5.2,
    text: `<i>By going home to study,</i><br/>

    You realise there are other pressing priorities at home.
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
    text: `You get home to discover that your grandparent is unwell and needs medication. What do you do?`,
    options: [
      {
        text: `Take them to the clinic and pick up some medication from the pharmacy.`,
        next: 6.1,
        updateState: { time: -2, wealth: -50 },
      },
      {
        text: `Fix the issue another day.`,
        next: 6.2,
        updateState: { time: -3 },
      }
    ]
  },
  {
    id: 6.1,
    text: `<i>By taking your grandparent to the clinic,</i><br/>

    <bold>Your time significantly decreases.</bold>
    You will have to wait with your grandparent until they can get an appointment, and help them communicate with the doctor.<br/><br/>

    <bold>Your money sharply decreases.</bold>
    You need to pay a consultation fee in addition to the cost of the medication.
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
    text: `<i>By not taking your grandparent to the clinic,</i><br/>

    <bold>Your time significantly decreases.</bold> 
    You will have to look after your siblings because your grandparent is too unwell to do so. 
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
    text: `One of your best friends is celebrating their birthday this weekend. What do you plan to get them?`,
    options: [
      {
        text: `A handmade card, in order to save money.`,
        next: 7.1,
        updateState: { time: -0.5 },
      },
      {
        text: `A book voucher, pooled together with money from your classmates.`,
        next: 7.2,
        updateState: { wealth: -10 },
      }
    ]
  },
  {
    id: 7.1,
    text: `<i>By making them a handmade card,</i><br/>

    <bold>Your time decreases.</bold>
    You have to spend time not only making the card, but gathering the supplies you need in order to do so.<br/><br/>

    <bold>Your money stays the same.</bold>   
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
    text: `<i>By buying them a book voucher,</i><br/>

    <bold>Your time stays the same.</bold> 
    You are able to order the gift online and don’t have to visit the store to do so.<br/><br/>

    <bold>Your money decreases.</bold>
    You only have to contribute your share of the present. 
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
    text: `Bills have increased this month and your parents are working overtime to make ends meet. You need to find some dinner for yourself. What will you do?`,
    options: [
      {
        text: `Pick up food from the hawker centre.`,
        next: 8.1,
        updateState: { time: -0.25, wealth: -15 }
      },
      {
        text: `Work a shift at a fast-food restaurant and bring home the leftovers.`,
        next: 8.2,
        updateState: { time: -2, wealth: 60 }
      }
    ]
  },
  {
    id: 8.1,
    text: `<i>If you pick up food from the hawker centre,</i><br/>

    <bold>Your time decreases.</bold>
    Hawker centre food is ready to eat but also crowded at this time of day.<br/><br/>

    <bold>Your money decreases.</bold>
    `,
    options: [
      {
        text: `Continue`,
        next: 9,
      },
    ]
  },
  {
    id: 8.2,
    text: `<i>If you work a shift at a fast-food restaurant,</i><br/>

    <bold>Your time decreases.</bold>
    Shifts are a fixed interval of time and you cannot negotiate these.<br/><br/>

    <bold>Your money increases.</bold>
    `,
    options: [
      {
        text: `Continue`,
        next: 9,
      }
    ]
  },
  {
    id: 9,
    text: `You’re finally home. However, your laptop breaks down, meaning you can’t finish your remaining tasks. What do you do?`,
    options: [
      {
        text: `Go back to the library and see if you can use one of their laptops for now.`,
        next: 9.1,
        updateState: { time: -0.5 }
      },
      {
        text: `Reach out to a charity that provides free laptop loans to low-income students.`,
        next: 9.2,
        updateState: { time: -24 },
      }
    ]
  },
  {
    id: 9.1,
    text: `<i>By going back to the library,</i><br/>

    <bold>Your time decreases.</bold> 
    You have to find a way of getting back to the library, finding an available computer and getting your work done before closing time.
    `,
    options: [
      {
        text: `Continue`,
        next: 10,
        done: true,
      }
    ]
  },
  {
    id: 9.2,
    text: `<i>By reaching out to a charity,</i><br/>

    <bold>Your time significantly decreases.</bold> 
    Charity staff are only available during working hours and will need time to process your application.
    `,
    options: [
      {
        text: `Continue`,
        next: 10,
        done: true,
      }
    ]
  },
  {
    id: 10,
    text: `Do you have enough resources (0.50 hour and $100) to submit your university application?`,
    options: [
      {
        text: `Yes`,
        next: "win",
      },
      {
        text: `No`,
        next: "lose",
      }
    ]
  },
  {
    id: 10.1,
    text: `Congratulations, you have completed your goals.

    However, it is worth keeping in mind that not everybody has the resources to do so. Try repeating this exercise as a different player and see for yourself.
    `,
    options: [
      {
        text: `Try Again`,
        next: -1,
      },
      {
        text: `Quit`,
        next: -2,
      }
    ]
  },
  {
    id: 10.2,
    text: `You have not completed your goals and missed an opportunity for social mobility. Although you can repeat this exercise by playing as the same persona and making different choices, you can also try again as a different persona. Think about whether it is easier or harder for some people to approach these tasks due to the differing levels of time and money available. 
    `,
    options: [
      {
        text: `Try Again`,
        next: -1,
      },
      {
        text: `Quit`,
        next: -2,
      }
    ]
  }
]

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
const credit1BtnElement = document.getElementById("credit1-btn");
const end1Element = document.getElementById("end1");
const end1BtnElement = document.getElementById("end1-btn");
const end4BtnElement = document.getElementById("end4-btn");
const gameoverElement = document.getElementById("gameover");
const gameoverBtnElement = document.getElementById("gameover-btn");
const restartBtnElement = document.getElementById("restart-btn");
// button interactions
welcomeBtnElement.onclick = () => {
  welcomeElement.classList.add("out");
  setTimeout(() => toggleHide(backgroundElement, welcomeElement, intro1Element), 1000);
};
intro1BtnElement.onclick = () => toggleHide(intro1Element, intro2Element);
intro2BtnElement.onclick = () => toggleHide(intro2Element, intro3Element);
end1BtnElement.onclick = () => restart();
creditBtnElement.onclick = () => toggleHide(end1Element, creditElement);
credit1BtnElement.onclick = () => toggleHide(gameoverElement, creditElement);
end4BtnElement.onclick = () => restart();
gameoverBtnElement.onclick = () => {
  toggleHide(gameoverElement);
  restart();
};

restartBtnElement.onclick = () => {
  toggleHideWithoutIn(currProfile);
  toggleProfileBtn();
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
  for (let i = 1; i < 4; i++) {
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
  ({ text: contentTextElement.innerHTML } = textNode);

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
    if (option.text === "Yes") {
      const { [record.length - 1]: latest } = record;
      if (latest["wealth"] < 100 || latest["time"] < 0.5) {
        console.log("lose!!")
        button.disabled = true;
        button.style.border = "none";
        button.style.textDecoration = "line-through";
        button.style.backgroundColor = "darkgrey";
        setTimeout(() => {
          button.classList.add("puff-out-center");
        }, 3000);
        setTimeout(() => {
          button.classList.add("hide")
        }, 4000)
      } else {
        button.style.backgroundColor = "mediumspringgreen";
      }
    }
    if (option.text === "No") {

      const { [record.length - 1]: latest } = record;
      if (latest["wealth"] >= 100 && latest["time"] >= 1) {
        console.log("win!!")
        button.disabled = true;
        button.style.border = "none";
        button.style.textDecoration = "line-through";
        button.style.backgroundColor = "darkgrey";
        setTimeout(() => {
          button.classList.add("puff-out-center");
        }, 3000);
        setTimeout(() => {
          button.classList.add("hide")
        }, 4000)
      } else {
        button.style.backgroundColor = "mediumspringgreen";
      }
    }
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
    if (element.innerText.split(" ")[0] !== latest[meter].toFixed(2)) {
      if (meter === "wealth" && element.innerText !== latest[meter].toString()) {
        document.getElementById(meter).classList.add("vibrate-1");
        setTimeout(() => {
          element.innerText = latest[meter];
        }, 500);
        setTimeout(
          () => document.getElementById(meter).classList.remove("vibrate-1"),
          400
        );
        setTimeout(() => element.classList.add("in"), 500);
        setTimeout(() => element.classList.remove("in"), 2000);
      }
      if (meter === "time") {
        document.getElementById(meter).classList.add("shake-horizontal");
        setTimeout(
          () => document.getElementById(meter).classList.remove("shake-horizontal"),
          400
        );
        setTimeout(() => {
          element.getElementsByTagName("span")[0].remove();
          var elem = document.createElement("span");
          elem.innerText = latest[meter].toFixed(2);
          element.prepend(elem);
        }, 500);
        setTimeout(() => element.classList.add("in"), 500);
        setTimeout(() => element.classList.remove("in"), 2000);
      }

    }
  });
}


const selectOption = function (option) {
  newState = { ...record[record.length - 1] };
  const { "next": nextTextNodeId } = option;
  if (nextTextNodeId === "win") {
    return goEndScene();
  }
  if (nextTextNodeId === "lose") {
    return goGameOverScene();
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
  if (newState["time"] <= 0 && nextTextNodeId !== -1) {
    setTimeout(goGameOverScene, 1000);
  }
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
  toggleHide(intro3Element);
  intro3Element.classList.remove("in");
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