import {Component} from './base-component.js';
import {Project} from '../models/project.js';
import {Draggable} from '../models/drag-drop.js'


export class ProjectItem extends Component<HTMLUListElement,HTMLLIElement> implements Draggable{
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