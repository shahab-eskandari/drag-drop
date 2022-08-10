import {Project, ProjectStatus} from '../models/project.js'; 

type Listener<T> = (items: T[])=>void; 


    //Project State Management

class State<T>{
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>){
        this.listeners.push(listenerFn);
    } 
}

class ProjectState extends State<Project> {
    
    private projects: Project[] = [];
    private static instance : ProjectState;

    private constructor(){
        super()
    }

    static getInstance (){
        if(this.instance){
            return this.instance; 
        }else{
            this.instance = new ProjectState();
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

export const projectState = ProjectState.getInstance(); 