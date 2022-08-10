import {Component} from '../components/base-component.js';
import {DragTarget} from '../models/drag-drop.js';
import {ProjectItem} from '../components/project-item.js';
import {Project, ProjectStatus} from '../models/project.js'; 
import { projectState } from '../state/project-state.js';

export class ProjectList extends Component<HTMLDivElement,HTMLElement> implements DragTarget {
        
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