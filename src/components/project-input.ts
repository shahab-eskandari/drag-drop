import {Component} from '../components/base-component.js';
import { Validatable, validate } from '../util/validation.js';
import { projectState } from '../state/project-state.js';


export class ProjectInput extends Component<HTMLDivElement,HTMLFormElement>{
        
    //accessing to inputs in the form: 
    titleInputElement: HTMLInputElement; 
    descriptionInputElement: HTMLInputElement; 
    peopleInputElement: HTMLInputElement; 

    constructor(){
        super('project-input','app','afterbegin','user-input')
        
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement; 

        //importNode creates a copy of its first arqument
        //template.content returns everything beteen <template> and </template> 
        // const importedNode = document.importNode(this.templateElement.content, true);
        // console.log(importedNode.firstChild) //for remiding the difference between firstChild and firstElementChild

        // this.element = importedNode.firstElementChild as HTMLFormElement;
        // //adding the id to form for applying CSS
        // this.element.id = 'user-input';
        
        //initializing the input elements in the form: 
        //this.titleInputElement = document.querySelector('#title') as HTMLInputElement;
        
        this.configure();

        //attach method will put the form inside of the template into the target(host) element
        //this.attach(); 
    }

    configure (){    
        this.element.addEventListener('submit', this.submitHandler.bind(this))
    }

    renderContent(): void {
        
    }

    private getInputs ():[string,string,number] | void{
        const inputTitle = this.titleInputElement.value;
        const inputDescription = this.descriptionInputElement.value;
        const inputPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable={
            value: inputTitle,
            required: true
        };
        const descriptionValidatable: Validatable={
            value: inputDescription,
            required: true, 
            minLength: 5,
        };
        const peopleValidatable: Validatable={
            value: +inputPeople,
            required: true, 
            min:0,
            max:5 
        }
        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
            ){
            alert('Inavlid inputs, please try again!');
            return; 
        }else{
            return [inputTitle,inputDescription,+inputPeople];  
        }
    }

    private clearInputs (){
        this.titleInputElement.value='';
        this.descriptionInputElement.value='';
        this.peopleInputElement.value='';
    }

    private submitHandler (event: Event){
        event.preventDefault(); 
        const userInput = this.getInputs();
        if(Array.isArray(userInput)){
            const [title, desc, people]=userInput;
            projectState.addProject(title,desc,people);
            this.clearInputs();
        }
    }
}