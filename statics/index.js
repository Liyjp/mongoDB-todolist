window.onload = function () {

    const HOST = 'http://127.0.0.1';
    const PORT = '8080';

    let msgDiv = $('#msg_div');
    let todoInput = $('#todo_input');
    let todoTable = $('#todo_table');
    let doneTable = $('#done_table');

    let allBtn = $('#all_btn');
    let activeBtn = $('#active_btn');
    let completeBtn = $('#complete_btn');
    let clearCompleteBtn = $('#clear_complete_btn');

    let leftItemsSpan = $('#left_items_span');

    let leftItemsCount = 0;
    let todoList = [];

    todoInput.keydown(function () {
        if (e.which === 13) {
            let todo = todoInput.val();
            if (todo !== "") {
                todoInput.val("");
                push("todo", todo);
            }
        }
    });

    allBtn.click(function () {
        todoTable.css("display", "table-row-group");
        doneTable.css("display", "table-row-group");
    });

    activeBtn.click(function () {
        todoTable.css("display", "table-row-group");
        doneTable.css("display", "none");
    });

    completeBtn.click(function () {
        todoTable.css("display", "none");
        doneTable.css("display", "table-row-group");
    });

    clearCompleteBtn.click(function () {
        push("clear", "");
    });
    
    function push(opt,data) {
        $.ajax({
            url: HOST+":"+PORT+"/todo",
            type: 'PUT',
            contentType: "text/plain",
            data: JSON.stringify({'opt':opt,'data':data}),
            success: ()=>{update();}
        })
    }
    function update() {
        $.ajax({
            url: HOST+":"+PORT+"/todo",
            type: "GET",
            success: (res) => {
                todoList = JSON.parse(res);
                addTodo();
                addDone();
                leftItemsSpan.html("Left items: "+todoList.todo.length);
                if (todoList.done.length > 0) {
                    $("#clear_complete_btn").css("display", "inline-block");
                }
            }
        });
    }
    function addTodo() {
        todoTable.html("");
        for (let i of todoList.todo) {
            todoTable.append(`
            <tr>
                <td class='item'><li>${i}</li></td>
                <td class='close_icon'>X</td>
            </tr>`)
        }
        $(".close_icon").on("click", (e)=>{
            push("delete", e.target.parentElement.firstElementChild.textContent);
        });
        $("#todo_table tbody tr .item").on("click", (e)=>{
            push("done", e.target.textContent);
        });
    }

    function addDone() {
        doneTable.html("");
        for (let i of todoList.done) {
            doneTable.append(`
            <tr>
                <td><li class='item'>${i}</li></td>
                <td class='close_icon'></td>
                </tr>`)
        }
        $("#done_table tbody tr").on("click", (e)=>{
            push("reset", e.target.textContent);
        });
    }

    update();

};
