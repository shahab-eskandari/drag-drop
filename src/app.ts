//Drag and drop interfaces 
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void; 
}

interface DragTarget{
    dragOverHandler(event:DragEvent):void; 
    dropHandler(event: DragEvent): void; 
    dragLeaveHandler(event:DragEvent): void;
}

//Project type 
enum ProjectStatus {
    Active, 
    Finished
}

class Project {
    constructor(
        public id:string, 
        public title: string, 
        public description: string, 
        public people: number,
        public status: ProjectStatus
    ){}
}

//Listener type 
type Listener<T> = (items: T[])=>void; 


//Project State Management

class State<T>{
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>){
        this.listeners.push(listenerFn);
    } 
}

class ProjectSate extends State<Project> {
    
    private projects: Project[] = [];
    private static instance : ProjectSate;

    private constructor(){
        super()
    }

    static getInstance (){
        if(this.instance){
            return this.instance; 
        }else{
            this.instance = new ProjectSate();
            return this.instance;
        }
    }

    addProject(title: string, description: string, numOfPeople:number){
        const newProject = new Project(
            Math.random().toString(),
            title,
            description, 
            numOfPeople,
            ProjectStatus.Active
        )

        this.projects.push(newProject);

        this.updateListeners(); 
    }

    switchProject(projectId: string, newStatus: ProjectStatus){
        const targetProjec= this.projects.find(project=>project.id===projectId)
        //currentProject ca be null, so we check that:
        if(targetProjec && targetProjec.status!==newStatus){
            targetProjec.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners(){
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectSate.getInstance(); 

//========================================================================
//Implementing the validation process: 

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
//=================================================================================

//component base element 
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement; 
    hostElement: T; 
    element : U;

    constructor(
        templateId: string, 
        hostElementId: string,
        insertPlace: 'afterbegin' | 'beforeend', 
        newElementId?: string
    ){
        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        
        this.element = importedNode.firstElementChild as U;
        //adding the id to element if there is any:
        if(newElementId){
            this.element.id = newElementId;
        }

        this.attach(insertPlace); 
    }

    private attach(insertLocation:'afterbegin' | 'beforeend'){
        this.hostElement.insertAdjacentElement(
            insertLocation, this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

//===========================================================
//ProjectItem Class: responsible for rendering items
class ProjectItem extends Component<HTMLUListElement,HTMLLIElement> implements Draggable{
    private project: Project;
    
    get peopleText(){
        if(this.project.people===1){
            return '1 person'; 
        }else{
            return `${this.project.people} people`
        }
    } 

    constructor(hostId: string, project:Project){
        super('single-project',hostId,'beforeend',project.id)
        this.project = project;
        
        this.configure();
        this.renderContent();
    }

    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed='move'; 
    }

    dragEndHandler(_: DragEvent): void {
        //console.log('Drag Ended!');
        //console.log(event);
    }

    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
        this.element.addEventListener('dragend',this.dragEndHandler.bind(this));
    }

    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title; 
        this.element.querySelector('h3')!.textContent = this.peopleText + ' assigned';
        this.element.querySelector('p')!.textContent = this.project.description; 
                
    }

}

//===========================================================

class ProjectList extends Component<HTMLDivElement,HTMLElement> implements DragTarget {
    
    assignedProjects: Project[]; 

    constructor(private type:'active'|'finished'){
        super('project-list','app','beforeend',`${type}-projects`); 
        
        this.assignedProjects=[];

        this.configure();
        this.renderContent();
    }

    dragOverHandler(event: DragEvent): void {
        if(event.dataTransfer && event.dataTransfer.types[0]==='text/plain'){
            event.preventDefault(); //for allowing drop happens, by default JS dose not let drop happens
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable'); 
        }  
    }

    dropHandler(event: DragEvent): void {
        const dropedProject = event.dataTransfer!.getData('text/plain');
        projectState.switchProject(dropedProject,
            this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished  
            )
    }

    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const projectItem of this.assignedProjects){
            new ProjectItem(this.element.querySelector('ul')!.id,projectItem);
        }
    }

    configure(): void {
        this.element.addEventListener('dragover',this.dragOverHandler.bind(this));
        this.element.addEventListener('dragleave',this.dragLeaveHandler.bind(this));
        this.element.addEventListener('drop',this.dropHandler.bind(this));

        projectState.addListener((projects: Project[])=>{
            const relevantProjects  = projects.filter((prj)=>{
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;  
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        })
        
    }

    renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId; 
        this.element.querySelector('h2')!.textContent = this.type.toLocaleUpperCase() + ' PROJECTS';
    }
} 

class ProjectInput extends Component<HTMLDivElement,HTMLFormElement>{
    
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

const prjInput = new ProjectInput();
const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');