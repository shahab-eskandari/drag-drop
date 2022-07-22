class ProjectInput{
    templateElement: HTMLTemplateElement; 
    hostElement: HTMLDivElement; 
    element : HTMLFormElement; 
    constructor(){
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostElement = <HTMLDivElement> document.getElementById('app')!;
    
        //importNode creates a copy of its first arqument
        //template.content returns everything beteen <template> and </template> 
        const importedNode = document.importNode(this.templateElement.content, true);
        console.log(importedNode.firstChild)

        this.element = importedNode.firstElementChild as HTMLFormElement;
        //adding the id to form for applying CSS
        this.element.id = 'user-input';
        //attach method will put the form inside of the template into the target(host) element
        this.attach(); 

    }
    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin',this.element);
    }
}

const prjInput = new ProjectInput();