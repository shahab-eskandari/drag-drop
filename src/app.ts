//Project State Management
class ProjectSate {
    private listeners: any[] = []; 
    private projects: any[] = [];
    private static instance : ProjectSate;

    private constructor(){

    }

    static getInstance (){
        if(this.instance){
            return this.instance; 
        }else{
            this.instance = new ProjectSate();
            return this.instance;
        }
    }

    addListener(listenerFn: Function){
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numOfPeople:number){
        const newProject ={
            id: Math.random().toString(),
            title: title,
            description: description, 
            people: numOfPeople
        };
        this.projects.push(newProject);
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectSate.getInstance(); 

interface Validatable {
    value: string | number; 
    required?: boolean; 
    minLength?: number;
    maxLength?: number; 
    min?: number;
    max?: number; 
}

function validate(input:Validatable){
    let isValid = true; 
    if(input.required){
        isValid = isValid && input.value.toString().trim().length !== 0;     
    }
    
    if(
        input.minLength != null &&
        typeof input.value === 'string'
    ){
        isValid = isValid && input.value.length > input.minLength; 
    }
    
    if(
        input.maxLength != null &&
        typeof input.value === 'string'
    ){
        isValid = isValid && input.value.length < input.maxLength; 
    }

    if(
        input.min != null &&
        typeof input.value === 'number'
    ){
        isValid = isValid && input.value > input.min ; 
    }

    if(
        input.max != null &&
        typeof input.value === 'number'
    ){
        isValid = isValid && input.value < input.max ; 
    }

    return isValid; 
}

class ProjectList{
    templateElement: HTMLTemplateElement; 
    hostElement: HTMLDivElement; 
    element : HTMLElement;
    assignedProjects: any[]; 

    constructor(private type:'active'|'finished'){
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-list')!;
        this.hostElement = <HTMLDivElement> document.getElementById('app')!;
        
        this.assignedProjects=[];
        //importNode creates a copy of its first arqument
        //template.content returns everything beteen <template> and </template> 
        const importedNode = document.importNode(this.templateElement.content, true);
        console.log(importedNode.firstChild) //for remiding the difference between firstChild and firstElementChild

        this.element = importedNode.firstElementChild as HTMLElement;
        //adding the id to form for applying CSS
        this.element.id = `${this.type}-projects`;
        
        projectState.addListener((projects: any[])=>{
            this.assignedProjects = projects;
            this.renderProjects();
        })

        this.attach();
        this.renderContent();
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        for (const projectItem of this.assignedProjects){
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId; 
        this.element.querySelector('h2')!.textContent = this.type.toLocaleUpperCase() + ' PROJECTS';
    }

    private attach(){
        this.hostElement.insertAdjacentElement('beforeend',this.element);
    }
} 

class ProjectInput{
    templateElement: HTMLTemplateElement; 
    hostElement: HTMLDivElement; 
    element : HTMLFormElement;
    
    //accessing to inputs in the form: 
    titleInputElement: HTMLInputElement; 
    descriptionInputElement: HTMLInputElement; 
    peopleInputElement: HTMLInputElement; 

    constructor(){
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostElement = <HTMLDivElement> document.getElementById('app')!;
    
        //importNode creates a copy of its first arqument
        //template.content returns everything beteen <template> and </template> 
        const importedNode = document.importNode(this.templateElement.content, true);
        console.log(importedNode.firstChild) //for remiding the difference between firstChild and firstElementChild

        this.element = importedNode.firstElementChild as HTMLFormElement;
        //adding the id to form for applying CSS
        this.element.id = 'user-input';
        
        //initializing the input elements in the form: 
        //this.titleInputElement = document.querySelector('#title') as HTMLInputElement;
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement; 
        console.log(this.titleInputElement);
        console.log(this.descriptionInputElement); 
        console.log(this.peopleInputElement);
        
        this.configure();

        //attach method will put the form inside of the template into the target(host) element
        this.attach(); 
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
            min:1,
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

    private configure (){
        this.element.addEventListener('submit', this.submitHandler.bind(this))
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin',this.element);
    }
}

const prjInput = new ProjectInput();
const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');