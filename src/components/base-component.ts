
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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