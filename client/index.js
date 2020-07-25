const vue = new Vue({
    el : '#app',
    data: {
        todo : '',
        todos : [],
        todosWithId : [],
        alertText : '',
        isAlertOn : false,
        successClass : false,
    },
    mounted(){
        this.getAllTodos();
    },
    methods:{
        errorHandler(text,time=3000,state='error'){
            this.isAlertOn = !this.isAlertOn;
            this.alertText = text;
            if(state === 'error'){
                this.dangerClass = true;
            }
            if(state === 'success'){
                this.successClass = true;
            }
            setTimeout(()=>{
                this.isAlertOn = false;
                this.alertText = '';
                this.dangerClass = false;
                this.successClass = false;
            },time);
        },
        addTodo(){
            // console.log(this.todo);
            let data = {
                content : this.todo,
                status : false,
            }
            this.todos.push(data);
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(data)
            }
            if(data.content.trim().length !== 0){
                fetch('/todo',options)
                .then(res=>res.json())
                .then(data=>{
                    this.todosWithId.push(data);
                    // this.errorHandler('Added successfully!',2000,'success');
                })
                .catch(err=>{
                    if(err){
                        this.errorHandler('Unable to add! please consult logs',2000,'error');                    }
                })
            }else{
                this.errorHandler('Cannot add empty data!',1000);
            }
            
            this.todo = '';
        },
        getAllTodos(){
            fetch('/all')
                .then(response=>response.json())
                .then(data=>{
                    let results = JSON.parse(data);
                    this.todosWithId = results;
                })
                .catch(err=>{
                    this.errorHandler('Sorry error in the server! please consult error logs');
                });
        },
        todoDone(todo){
            todo.status = !todo.status;
            // here we send the required status to 
            // the server about the todo to update with the curreent value!
            let data = {
                id : todo._id,
                status : todo.status
            };
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(data)
            };
            fetch('/updateTodo',options)
                .then(res=>res.json())
                .then(message=>{
                    console.log(message.message);
                    // this.errorHandler('Updated succesfully!',500,'success');
                })
                .catch(err=>{
                    todo.status = false;
                    this.errorHandler('Sorry problem in updating! please check error logs!');
                });
        },
        deleteTodo(index,todo){
            let data = {
                id : todo._id
            };
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(data)
            }
            fetch('/deleteTodo',options)
                .then(res=>res.json())
                .then(message=>{
                    this.todosWithId.splice(index,1);
                    // this.errorHandler('Deleted successfully!',800,'success');
                })
                .catch(err=>{
                    this.errorHandler('Sorry unable to delete! please check server logs!',2000,'error');
                });
        },
        deleteAllTodos(){
            fetch('/deleteAll')
                .then(res=>res.json())
                .then(message=>{
                    this.todosWithId = [];
                    this.errorHandler('Deleted all successfully!',2000,'success');
                })
                .catch(err=>{
                    this.errorHandler('Sorry unable to delete, please check logs in server!');
                })
        },
    },
});
