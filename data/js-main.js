
window.onload = function() {
    //start program
    setup();
}

//Class definitions
function Player(name) {
    this.name = name;
    this.score = 0;
}

//execute on startup
function setup() {

    //create global
    board = {
        players: [],
        old: [],
        popup: ""
    };

    //set input field size
    let buttonHeight = $("#add").height() + Number($("#add").css("padding").replace("px",""));
    $("input").css("height", $("#add").height()+buttonHeight-5);

    //add event listeners
    $("#add").on("click", add_player);
    $("#reset").on("click", reset_scores);
    $("#delete").on("click", clear_game);
    $("#undo").on("click", undo_move);
    $("#p-cancel").on("click", hide_popup);
    $("#p-add").on("click", add_score);
    $("#p-submit").on("click", rename_player);
    $("#p-delete").on("click", delete_player);

    //set popup left-right alignment
    let wid = $("#popup-inner").width(),
        left = ($(window).width() - wid)/2;
    $("#popup-inner").css("left", left);

    //declare start of record
    console.log("--- START RECORD ---");

    //draw canvas
    draw_canvas();

}

//runs on cancel click from popup
function hide_popup() {
    //clear popup name id
    board.popup = "";
    //clear popup input box info
    $("#p-add-input").val("");
    $("#p-name-input").val("");
    //close popup window
    $("#popup-parent").css("visibility", "hidden");
    //refresh canvas
    draw_canvas();
}

//runs on name click event
function show_popup(name) {
    //save popup name id
    board.popup = name;
    //open popup window
    $("#popup-parent").css("visibility", "visible");
}

//runs on "undo" button click
function undo_move() {
    //flip players and old
    let temp = board.players;
    board.players = board.old;
    board.old = temp;
    //record change
    console.log("UNDO LAST MOVE");
    //change text inside button
    if($("#undo").text() === "REDO") {
        $("#undo").text("UNDO");
    } else {
        $("#undo").text("REDO");
    }
    //refresh canvas
    draw_canvas();
}

//runs on "add score" in popup
function add_score() {

    //validate input
    if(!$("#p-add-input").val()) {
        return false;
    } else if(isNaN(Number($("#p-add-input").val()))) {
        return false;
    }

    //save old layout
    save_canvas();

    //find player to apply change
    let change = $("#p-add-input").val();
    for(player of board.players) {
        if(player.name == board.popup) {
            //change and post to record
            console.log(player.name,"ADD",change);
            player.score =  Number(change)+Number(player.score);
        }
    }

    //exit popup
    hide_popup();
}

//runs on rename submit in popup
function rename_player() {

    //validate input
    if(!$("#p-name-input").val()) {
        return false;
    }

    //save old layout
    save_canvas();

    //find player to apply change
    let change = $("#p-name-input").val();
    for(player of board.players) {
        if(player.name == board.popup) {
            //change and post to record
            console.log(player.name,"RENAMED",change);
            player.name = change;
        }
    }

    //exit popup
    hide_popup();
}

//runs on "delete player" in popup
function delete_player() {
    //warn user
    if(confirm("Are you sure you want to delete "+board.popup+"?")) {
        //save old layout
        save_canvas();
        for(player of board.players) {
            if(player.name == board.popup) {
                //find and delete player
                let index = board.players.indexOf(player);
                board.players.splice(index,1);
                //record change
                console.log("DELETE", player.name);
            }
        }
        //exit popup
        hide_popup();
    }
}

//runs on "add player" button click
function add_player() {

    //validate input
    if(!$("#nameinput").val()) {
        return false;
    }

    //save old layout
    save_canvas();

    //grab name, create player, add to array
    let name = $("#nameinput").val();
    let newPlayer = new Player(name);
    board.players.push(newPlayer);

    //clear text box
    $("#nameinput").val("");

    //refresh canvas
    draw_canvas();

    //post to record
    console.log("NEW",name);

}

//runs on "reset scores" button click
function reset_scores() {
    let text = "Are you sure you want to reset all scores to zero?";
    if(confirm(text)) {
        //save old layout
        save_canvas();
        //reset all player scores
        for(player of board.players) {
            player.score = 0;
        }
        //record change
        console.log("RESET ALL TO ZERO");
        //refresh canvas
        draw_canvas();
    }
}

//runs on "delete players" button click
function clear_game() {
    let text = "Are you sure you want to clear all scores and delete all players?";
    if(confirm(text)){
        //save old layout
        save_canvas();
        //clear players variable
        board.players = [];
        //record change
        console.log("DELETE ALL");
        //refresh canvas
        draw_canvas();
    }
}

//returns html-styled player text
function player_text(name, score, winning) {
    let crown = "<img src='data/crown.png' />";
    if(!winning) {
        crown = "";
    }
    let start = "<tr>",
        text1 = "<td><button onclick='show_popup(`"+name+"`)'>"+name+"</button></td>",
        text2 = "<td>"+score+"</td>",
        text3 = "<td class='crown'>"+crown+"</td>",
        end = "</tr>";
    return start+text1+text2+text3+end;
}

//sets order of players by score
function rank_names() {
    let change = false;
    do {
        change = false;
        let i = -1;
        while(++i < board.players.length-1) {
            //get scores
            let score1 = board.players[i].score,
                score2 = board.players[i+1].score;
            if(score1 < score2) {
                //swap
                let temp = board.players[i+1];
                board.players[i+1] = board.players[i];
                board.players[i] = temp;
                //update change
                change = true;
            }
        }
    } while(change);
}

//saves current player status to hidden variable
function save_canvas() {
    // board.old = board.players;
    board.old = [];
    for(player of board.players) {
        let p = {};
        p.name = player.name,
        p.score = player.score;
        board.old.push(p);
    }
    //set "undo" button
    $("#undo").text("UNDO");
}

//returns whether given player is winning
function is_winning(player) {
    let winScore = board.players[0].score;
    return player.score === winScore;
}

//sets canvas table with names and scores
function draw_names() {
    let text = "";
    for(player of board.players) {
        text += player_text(player.name, player.score, is_winning(player));
    }
    $('#canvas').html(text);
}


//runs on change in html values
function draw_canvas() {
    rank_names();
    draw_names();
}
