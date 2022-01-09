// Helper for awaiting fames repainting
function perform_after_first_repaint(func) {
    // MDN refference to this structure
    // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(func)
    })
}

// Categories for awailable to be selected
const ALLOWED_CATEGORIES = [
    'CSS',
    'JS',
    'HTML'
]
// LocalStorage interface constant
const localStorage = window.localStorage;

// Variable, which stores scroll on popup open
// to preserve scroll position after popup close
let SCROLL_POSITION = 0;

let questions = []

function open_popup() {
    const body = document.querySelector('.body');
    const popup = document.querySelector('.popup');

    // Saving current scroll position
    SCROLL_POSITION = window.scrollY;

    // Remove scroll from body and open popup
    body.className = 'body has_popup';
    popup.className = 'popup';
}

function hide_popup() {
    const body = document.querySelector('.body');
    const popup = document.querySelector('.popup');

    // Add scroll to body and close popup
    body.className = 'body';
    popup.className = 'popup ui__hidden';

    // Perform scroll position change after window repaint
    // to be sure that scroll position applies to window,
    // which already has rendered scroll
    perform_after_first_repaint(
        () => {
            window.scrollTo(0, SCROLL_POSITION);
        }
    )
}

// Question form submition handler
function question_submit() {
    const questionText = document.getElementById('form__text');
    const questionCategory = document.getElementById('form__category');
    const warning = document.querySelector('.form__warning');

    // Storing form data in question format
    const form = {
        id: 200,
        text: questionText.value,
        category: questionCategory.value,
        timestamp: Math.floor(Date.now() / 1000)
    }


    // From validation
    let isValid = true;
    // Checking if text input contains only whitespaces
    if (form.text.replace(/\s+/g, '') == '') {
        isValid = false;
        // Showing warning message and apply 'danger' state on textfield
        warning.innerText = 'Question text can not be empty';
        warning.className = 'form__warning';
        questionText.className = 'form__input ui__danger'
    }
    else {
        // Removing warning message and 'danger' state from textfied
        warning.className = 'form__warning ui__hidden';
        questionText.className = 'form__input'
    }

    if (isValid) {
        questionText.value = '';

        // Pushing valid question to localstorage,
        // hide popup and render questions
        add_question_to_localstorage(form)
        hide_popup();
        render_questions();
    }
}

// Rendering questions 
function render_questions() {
    const categorySelector = document.getElementById('category');

    // Getting questions from localstorage
    questions = get_questions_from_localstorage();

    // Filtering questions by chousen category
    let questionsToRender = questions.filter(question => {
        return question.category == categorySelector.value
    })

    // Sort questions by tiestamp
    questionsToRender = questionsToRender.sort((a, b) => b.timestamp - a.timestamp)

    // Remove questions from screen and render updated
    const questionsDOM = document.querySelector('.questions');
    questionsDOM.querySelectorAll("*").forEach(question => question.remove())
    questionsToRender.forEach(question => {
        // Formattig timestamp to DD/MM/YY hh:mm format
        const date = new Date(question.timestamp * 1000);
        let year = date.getFullYear();
        let month =  "0" + (date.getMonth()+1);
        let day =  "0" + date.getDate();
        let hours = date.getHours();
        let minutes = "0" + date.getMinutes();
        var formattedTimestamp = `${day.slice(-2)}/${month.slice(-2)}/${year} ${hours}:${minutes.slice(-2)}`;

        // Creating DOMs which belongs to question block
        // and build question block
        const questionDateDOM = document.createElement('time');
        questionDateDOM.className = 'question__date';
        questionDateDOM.innerText = formattedTimestamp;

        const questionHeaderDOM = document.createElement('div');
        questionHeaderDOM.className = 'question__header';
        questionHeaderDOM.appendChild(questionDateDOM)

        const questionTextDOM = document.createElement('div');
        questionTextDOM.className = 'question__text';
        questionTextDOM.innerText = question.text;

        const questionCategoryDOM = document.createElement('div');
        questionCategoryDOM.className = 'question__category';
        questionCategoryDOM.innerText = question.category;

        const questionBodyDOM = document.createElement('div');
        questionBodyDOM.className = 'question__body';
        questionBodyDOM.appendChild(questionTextDOM);
        questionBodyDOM.appendChild(questionCategoryDOM);

        const questionDOM = document.createElement('div');
        questionDOM.className = 'question';
        questionDOM.appendChild(questionHeaderDOM);
        questionDOM.appendChild(questionBodyDOM);

        // Add question to questionsDOM
        questionsDOM.appendChild(questionDOM);
    })
}

// Retrieving questions from localstorage
// if exist. If no, return empy list
function get_questions_from_localstorage() {
    const questions = JSON.parse(localStorage.getItem('questions'))
    if (questions) {
        return questions
    }
    return []
}

// Putt question to localstorage
function add_question_to_localstorage(question) {
    let questions = JSON.parse(localStorage.getItem('questions'))
    if (!questions) {
        questions = [];
    }
    questions.push(question)
    localStorage.setItem('questions', JSON.stringify(questions))
}

// Initial function
function init() {
    // Clear seletors
    const categorySelector = document.getElementById('category');
    categorySelector.querySelectorAll('*').forEach(option => option.remove())
    const formCategorySelector = document.getElementById('form__category');
    formCategorySelector.querySelectorAll('*').forEach(option => option.remove())

    // Put options to selectors
    ALLOWED_CATEGORIES.forEach(category => {
        let option = document.createElement('option');
        option.value = category;
        option.innerHTML = category;
        
        categorySelector.appendChild(option.cloneNode(true))
        formCategorySelector.appendChild(option)
    })

    // First render of questions
    render_questions()
}

init();