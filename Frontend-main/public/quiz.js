/**
 * @file quiz.js
 * @brief Defines quiz questions and handles user interaction logic for a personality-based travel quiz.
 */


/**
 * @brief Array of quiz questions categorized by themes such as weather preference, pricing, and walkability.
 */
const questions = [
    {
        // Basic Weather Questions
        question: "What type of weather do you prefer?",
        options: [
            { img: "images/warmMostOfTime", desc: "Warm most of the time" },
            { img: "images/heatEveryDay", desc: "I love feeling the heat every single day" },
            { img: "images/mildWeatherSunshine", desc: "Mild weather with some sunshine" },
            { img: "images/snowFallingFromSky", desc: "White snow falling from the sky" },
        ]
    },
    {
        question: "Pick a vacation destination!",
        options: [
            { img: "images/sunnyBeachTown", desc: "A sunny beach town" },
            { img: "images/urbanCity", desc: "An urban city" },
            { img: "images/cozyForestCabin", desc: "A cozy forest cabin" },
            { img: "images/mountainVillage", desc: "A remote mountain village" },
        ]
    },
    {
        question: "Pick an activity!",
        options: [
            { img: "images/scuba", desc: "Swimming in the ocean" },
            { img: "images/skiing", desc: "Skiing down snowy slopes" },
            { img: "images/skateboardingThruCity", desc: "Skateboarding through the city" },
            { img: "images/hiking", desc: "Climbing or hiking outdoors" },
        ]
    },
    {
        // Adverse weather Questions
        question: "Which of these weather conditions would be the least bad?",
        options: [
            { img: "images/heatwave", desc: "Heat waves" },
            { img: "images/blizzard", desc: "Heavy snowstorms" },
            { img: "images/torrentialRains", desc: "Torrential rains" },
            { img: "images/strongWinds", desc: "Strong winds" },
        ]
    },
    {
        question: "How do you feel about possible adverse weather?",
        options: [
            { img: "images/cozyIndoors", desc: "I like to stay indoors" },
            { img: "images/prepared", desc: "I prepare with the appropriate gear and clothing" },
            { img: "images/somethingNew", desc: "It's an opportunity to experience something new" },
            { img: "images/planAroundIt", desc: "I'll make plans around it" },
        ]
    },
    {
        question: "What types of clothes do you prefer?",
        options: [
            { img: "images/shortsTanktop", desc: "Tank top and shorts" },
            { img: "images/warmLayeredClothes", desc: "Warm, layered clothes" },
            { img: "images/jeansHoodie", desc: "A hoodie and jeans" },
            { img: "images/bootsWindbreaker", desc: "A windbreaker and boots" },
        ]
    },
    {
        // Pricing Questions
        question: "What's your budget for your next trip?",
        options: [
            { img: "images/likeToSave", desc: "I like to save" },
            { img: "images/highValue", desc: "I'll spend money as long as I get value from the purchase" },
            { img: "images/splurgeConveniences", desc: "I like to splurge on conveniences and comfort" },
            { img: "images/moneyNotAFactor", desc: "Money is not a factor" },
        ]
    },
    {
        question: "How important is the affordability of a destination to you?",
        options: [
            { img: "images/cheapMotel", desc: "Very important" },
            { img: "images/balancedComfort", desc: "A good balance between price and comfort" },
            { img: "images/niceHotel", desc: "I'll pay more for location and style" },
            { img: "images/qualityFirst", desc: "Quality first, price later" },
        ]
    },
    {
        question: "How much do you usually spend while travelling or living?",
        options: [
            { img: "images/essentials", desc: "Essentials only" },
            { img: "images/budgetForActivities", desc: "I have a budget for the things I want to do" },
            { img: "images/diningAndFun", desc: "I'll go out to dine and for fun" },
            { img: "images/luxuryShopping", desc: "I like to indulge in shopping and luxury" },
        ]
    },
    {
        // Walkability Questions
        question: "What kind of environment is most appealing?",
        options: [
            { img: "images/denseCity", desc: "A dense, walkable city" },
            { img: "images/smallTown", desc: "Suburbia or a small town" },
            { img: "images/ruralPlace", desc: "A rural place" },
            { img: "images/mixedEnvironment", desc: "A neighborhood with a mix of walking and driving" },
        ]
    },
    {
        question: "How important is the ability to walk to destinations to you?",
        options: [
            { img: "images/walkEverywhere", desc: "Very important" },
            { img: "images/walkSometimes", desc: "I'd like to walk but not to everything" },
            { img: "images/driveLocally", desc: "I don't mind driving to most locations" },
            { img: "images/driveOpenRoads", desc: "I enjoy driving and open space" },
        ]
    },
    {
        question: "What's you most preferable daily commute?",
        options: [
            { img: "images/publicTransport", desc: "Public transport" },
            { img: "images/walk", desc: "Walking" },
            { img: "images/drive", desc: "Driving" },
            { img: "images/bike", desc: "Biking or other similar means" },
        ]
    }
    
];

let currentQuestion = 0;
let progress = 0;
let userAnswers = [];


/**
 * @brief Resets the quiz to let the user to retake it from the beginning.
 */
function retakeQuiz() {
    currentQuestion = 0;
    progress = 0;
    userAnswers = [];

    // Reset the progress bar width
    document.getElementById("progress-bar").style.width = `${progress}%`;

    document.getElementById("retakeButton").style.display = "none";

    // Hide results, show quiz
    document.getElementById("results-container").style.display = "none";
    document.querySelector(".personality__test").style.display = "block";

    // Reset button visibility
    document.getElementById("retakeButton").style.display = "none";
    document.getElementById("backButton").style.display = "none";

    // Re-enable answer buttons
    document.querySelectorAll(".option").forEach(button => {
        button.disabled = false;
    });

    updateQuiz();
}


/**
 * @brief Goes back to the previous quiz question
 */
function backButton() {
    document.querySelectorAll(".option").forEach(button => {
        button.disabled = false;
    });
    if (currentQuestion > 0) {
        currentQuestion--;
        progress = Math.max(progress - 8, 0); // Decrease progress
        updateQuiz();
    }
    if(currentQuestion == 0){
        progress = 0;
        document.getElementById("retakeButton").style.display = "none";
        updateQuiz();
    }
}

/**
 * @brief Gets the user's selected answer and advances to the next question.
 * @param selectedIndex - Index of the selected answer option.
 */
function selectAnswer(selectedIndex) {

    userAnswers.push(questions[currentQuestion].options[selectedIndex].desc); 

    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        progress = Math.min(progress + 8, 100); // Increase progress
        updateQuiz();
    } else {
        // When on the last question, set progress to 100%
        progress = 100;
        document.getElementById("progress-bar").style.width = `${progress}%`; // Update width
        document.getElementById("retakeButton").style.display = "inline-block";
        document.getElementById("backButton").style.display = "inline-block";

        // Disable answer buttons when quiz is finished
        document.querySelectorAll(".option").forEach(button => {
            button.disabled = true;
        });

        document.querySelector(".personality__test").style.display = "none";
        document.getElementById("results-container").style.display = "block";

        // Generate results
        showResults();

    }
}

/**
 * @brief Updates the quiz UI to reflect the current question and progress.
 */
function updateQuiz() {
    const questionElement = document.querySelector(".question");
    const options = document.querySelectorAll(".option");

    // Update the question text
    questionElement.innerText = questions[currentQuestion].question;

    // Update images and descriptions for each option
    questions[currentQuestion].options.forEach((option, index) => {
        const imgElement = options[index].querySelector("img");
        const descElement = options[index].querySelector("p");
        const basePath = option.img;

        // Try PNG first, then JPG if PNG fails
        imgElement.src = basePath + ".png";
        imgElement.onerror = function () {
             // Prevents infinite loop
            imgElement.onerror = null;
            // use JPG if image is not a PNG
            imgElement.src = basePath + ".jpg";
        };

        descElement.innerText = option.desc;
    });

    // Update the progress bar width based on current progress
    document.getElementById("progress-bar").style.width = `${progress}%`;

    // Show or hide the back button depending on the current question
    document.getElementById("backButton").style.display = currentQuestion > 0 ? "inline-block" : "none";
}

/**
 * @brief Analyzes the user's answers and displays categorized results.
 */
function showResults(){
    // basic weather vars
    let warm = 0;
    let cold = 0;
    let mild = 0;
    let hot = 0;
    
    // adverse weather vars
    let storm = 0;
    let snowstorm = 0;
    let heatwave = 0;
    let strong_winds = 0;
    let adverse = 0; 

    // pricing vars
    let cheap = 0;
    let moderate = 0;
    let costly = 0;
    let luxury = 0;

    // walk vars
    let walk = 0;
    let drive = 0;

    userAnswers.forEach(answer => {
    // Basic Weather
    if (answer == "Warm most of the time") warm++;
    else if (answer == "I love feeling the heat every single day") hot++;
    else if (answer == "Mild weather with some sunshine") mild++;
    else if (answer == "White snow falling from the sky") cold++;

    if (answer == "A sunny beach town") hot++;
    else if (answer == "An urban city") warm++;
    else if (answer == "A cozy forest cabin") mild++;
    else if (answer == "A remote mountain village") cold++;

    if (answer == "Swimming in the ocean") hot++;
    else if (answer == "Skiing down snowy slopes") cold++;
    else if (answer == "Skateboarding through the city") mild++;
    else if (answer == "Climbing or hiking outdoors") warm++;

    // Adverse Weather
    if (answer == "Heat waves") heatwave++;
    else if (answer == "Heavy snowstorms") snowstorm++;
    else if (answer == "Torrential rains") storm++;
    else if (answer == "Strong winds") strong_winds++;

    if (answer == "I like to stay indoors") adverse+=0;
    else if (answer == "I prepare with the appropriate gear and clothing") adverse+=.5;
    else if (answer == "It's an opportunity to experience something new") adverse++;
    else if (answer == "I'll make plans around it") adverse+=.5;

    if (answer == "Tank top and shorts") hot++;
    else if (answer == "Warm, layered clothes") cold++;
    else if (answer == "A hoodie and jeans") warm++;
    else if (answer == "A windbreaker and boots") mild++;

    // Pricing
    if (answer == "I like to save") cheap++;
    else if (answer == "I'll spend money as long as I get value from the purchase") moderate++;
    else if (answer == "I like to splurge on conveniences and comfort") costly++;
    else if (answer == "Money is not a factor") luxury++;

    if (answer == "Very important") cheap++;
    else if (answer == "A good balance between price and comfort") moderate++;
    else if (answer == "I'll pay more for location and style") costly++;
    else if (answer == "Quality first, price later") luxury++;

    if (answer == "Essentials only") cheap++;
    else if (answer == "I have a budget for the things I want to do") moderate++;
    else if (answer == "I'll go out to dine and for fun") costly++;
    else if (answer == "I like to indulge in shopping and luxury") luxury++;

    // Walkability
    if (answer == "A dense, walkable city") walk++;
    else if (answer == "Suburbia or a small town") drive++;
    else if (answer == "A rural place") drive++;
    else if (answer == "A neighborhood with a mix of walking and driving"){ walk+=.5; drive+=.5; }

    if (answer == "Very important") walk++;
    else if (answer == "I'd like to walk but not to everything") walk+=.75;
    else if (answer == "I don't mind driving to most locations") drive++;
    else if (answer == "I enjoy driving and open space") drive++;

    if (answer == "Public transport") walk+=.5;
    else if (answer == "Walking") walk++;
    else if (answer == "Driving") drive++;
    else if (answer == "Biking or other similar means") walk+=.5;
    });

    let finalResult = "";
    let resultImage = "";
    
    // warm
    if (warm > cold && warm > hot && warm > mild) {
        finalResult = "A warmer climate would suit you well!";
        resultImage = "images/warmTravel.jpg";
    } 
    // cold
    else if (cold > hot && cold > warm && cold > mild) {
        finalResult = "You'd thrive in cooler, overcast climates!";
        resultImage = "images/iceland.jpg";
    } 
    // hot
    else if (hot > warm && hot > cold && hot > mild) {
        finalResult = "You're best suited for a tropical destination!";
        resultImage = "images/tropicalResort.jpg";
    } 
    // mild
    else if (mild > warm && mild > cold && mild > hot) {
        finalResult = "You'd like milder weather!";
        resultImage = "images/mildTravel.jpg";
    }
    else {
        finalResult = "You have a very balanced taste in where you want to go! Try a cruise and diversify!";
        resultImage = "images/cruise.jpg";
    }

    // Displays the final results
    document.getElementById("quizOutcome").innerText = finalResult;
    document.getElementById("quizOutcome").classList.add("show");

    document.querySelector("#results-container img").src = resultImage;
    document.querySelector("#results-container img").style.display = "block";
}
// Initialize quiz on page load
updateQuiz();
