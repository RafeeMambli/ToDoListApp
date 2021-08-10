// TO-DO !

let todoList = [];
let user_id = 0;
var server_path = "http://localhost:3000";

$(document).ready(function() {
  user_id = getQueryStringValue("userId");
  initTaskList();
 });

 const todoListElement = document.querySelector("#myUL");
 document.querySelector("#add_button").addEventListener("click", addTodo);
 document.querySelector("#myInput").addEventListener("keydown", function(e) {
   if (e.keyCode == 13) {
     addTodo()
   }
 });


function getQueryStringValue (key) {
  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

async function initTaskList(){
  var db_return_list = await getTaskByUser();
  todoList = db_return_list.taskList;
  displayTodos()
}

function getTaskByUser() {
    return new Promise((resolve, reject) => {
        try {
            var frm_data = "id=" + user_id;
            $.ajax({
                type: "GET",
                url: server_path+'/getitems',
                data: frm_data,
                success: function(json_response) {
                    console.log(json_response)
                    resolve(json_response)
                },
                error: function(xhr, status, error) {
                    reject(error)
                }
            });
        } catch (error) {
            alert("get task list error" + error)
        }
    });
}


function setTaskByUser(taskList) {
    return new Promise((resolve, reject) => {
        try {
            var frm_data = "id=" + user_id + "&taskList=" + JSON.stringify(taskList);
            $.ajax({
                type: "GET",
                url: server_path+'/setitem',
                data: frm_data,
                dataType: "json",
                contentType: "application/x-www-form-urlencoded",
                success: function(json_response) {
                    console.log(json_response)
                    resolve(json_response)
                },
                error: function(xhr, status, error) {
                    reject(error)
                }
            });
        } catch (error) {
            alert("update task error" + error)
        }
    });
}



//-------GETTING VALUES FROM INPUT TO ARRAY OF OBJECTS-------
function addTodo() {
  const todoText = document.querySelector("#myInput").value;
  var taskStatus = $("#myInput").attr("data-taskStatus")
  if (todoText == "") {
    alert("You did not enter any item");
  } else {
    if($("#myInput").attr("data-taskStatus") == "new"){
      const todoObject = {
        id: todoList.length,
        todoText: todoText,
        isDone: false,
      };
      //---WITH UNSHIFT WE ADD THE NEW ELEMENT TO THE BEGINNING OF THE ARRAY
      //--SO THAT THE NEW ITEMS SHOW UP ON TOP
      todoList.unshift(todoObject);
    }
    else{
      let selectedTodoIndex = $("#myInput").attr("data-index")
      todoList[selectedTodoIndex].todoText = todoText;
    }

    setTaskByUser(todoList)
    displayTodos();
  }
}

function editToDo(event){
  const element = event.target;
  const todoId = element.getAttribute("data-id");
  $("#myInput").attr("data-taskStatus","edit");
  $("#myInput").val(element.innerText);
  $("#add_button").text("Update")
  const selectedTodoIndex = todoList.findIndex((item) => item.id == todoId);
  $("#myInput").attr("data-index",selectedTodoIndex);
}

//------CHANGING THE isDone VALUE TO TRUE WHEN THE ELEMENT IS CLICKED
//------OR TO FALSE IF IT WAS TRUE BEFORE
function doneTodo(event) {
    const element = event.target;
    const todoId = element.getAttribute("data-id");
    element.parentNode.setAttribute("draggable", false)
    const selectedTodoIndex = todoList.findIndex((item) => item.id == todoId);
    console.log(selectedTodoIndex)
    todoList[selectedTodoIndex].isDone ?
        (todoList[selectedTodoIndex].isDone = false) :
        (todoList[selectedTodoIndex].isDone = true);
    if (element.checked) {
        element.parentNode.classList.add("completed");
        const parent = element.parentElement.parentElement;
        parent.appendChild(element.parentElement);
    } else {
        element.parentNode.classList.remove("completed");
        const parent = element.parentElement.parentElement;
        parent.insertBefore(element.parentElement, parent.firstChild);
    }
    setTaskByUser(todoList)
    displayTodos();
}

//----TO DELETE AN ITEM; FROM THE LIST
function deleteItem(x) {
  todoList.splice(
    todoList.findIndex((item) => item.id == x),
    1
  );
  setTaskByUser(todoList)
  displayTodos();
}

function displayTodos() {
    todoListElement.innerHTML = "";
    document.querySelector("#myInput").value = "";
    $("#add_button").text("Submit");
    $("#myInput").attr("data-taskStatus", "new");

    todoList.sort(function(a, b) {
      return a.isDone - b.isDone;
    });

    todoList.forEach((item) => {
        const listElement = document.createElement("li");
        const taskChecklist = document.createElement('input') //line 10
        taskChecklist.type = 'checkbox' //line 11
        taskChecklist.setAttribute("data-id", item.id);
        taskChecklist.classList.add("checkBox");
        if (item.isDone) {
            taskChecklist.checked = true;
            listElement.setAttribute("draggable", false)
            listElement.classList.add("completed");
        } else {
            listElement.classList.add("draggable");
            listElement.setAttribute("draggable", true)
        }

        listElement.appendChild(taskChecklist)
        var list_name = document.createElement("label");
        list_name.innerHTML = item.todoText;
        list_name.setAttribute("data-id", item.id);
        list_name.addEventListener("dblclick", editToDo)
        listElement.appendChild(list_name)

        const delBtn = document.createElement("i");
        delBtn.setAttribute("data-id", item.id);
        delBtn.classList.add("far");
        delBtn.classList.add("fa-trash-alt");
        delBtn.setAttribute("data-id", item.id);

        taskChecklist.addEventListener("click", doneTodo);

        delBtn.addEventListener("click", function(e) {
            const delId = e.target.getAttribute("data-id");
            deleteItem(delId);
        });

        todoListElement.appendChild(listElement);
        listElement.appendChild(delBtn);
    });

    $('#myUL').sortable({
        items: '.draggable'
    });
    $('li:not(".draggable")').on('mousedown', function(e) {
        e.stopPropagation();
    });

}
