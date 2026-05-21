         let loggedinuser="";  
         let score=0;
         let currentquestion=0;
         let timeleft=10;
         let time;
         let selectedtopic="";
         let quizquestions= [];
         let correctsound=new Audio("correct.mp3");
         let wrongsound=new Audio("wrong.mp3");

         document.getElementById("topics").style.display = "none";
         document.getElementById("nextbtn").style.display = "none";
         document.getElementById("quizbox").style.display = "none";

         function login(){

          let username =
         document.getElementById("username").value;

         if(username ===""){
          alert("please enter username");
          return;
         }

            loggedinuser = username;

           fetch("/login", {

          method: "POST",

        headers: {
            "Content-Type":"application/json"
        },

        body: JSON.stringify({
            username: username
        })

    })

    .then(function(response){
        return response.json();
    })

    .then(function(data){

        alert(data.message);

        document.getElementById("welcome").innerText="welcome! "+ loggedinuser;

        setTimeout(function(){ 

        document.getElementById("welcome").innerText="";

        }, 3000);

        document.getElementById("loginbox").style.display="none";

        document.getElementById("quizbox").style.display="block";

    });

}

        function startquiz() {

          if(loggedinuser===""){
            alert("Plese Login First");
            return;
          }

            console.log("quiz is started");

    document.getElementById("startbtn").style.display =
        "none";
    document.getElementById("nextbtn").disabled=false;

    document.getElementById("nextbtn").style.display="block";

    document.getElementById("topics").style.display="block";

}

          function selecttopic(topic){

          selectedtopic = topic;

            currentquestion = 0;

          score = 0;
        
           document.querySelectorAll('#topics button').forEach(b => b.classList.remove('selected'));
         event.target.classList.add('selected');

         document.getElementById("topicname").innerText = "Topic:" + selectedtopic;
         
          document.getElementById("topicname").innerText="Topic:"+selectedtopic;
         document.getElementById("topics").style.display = "none";

        fetch("/questions/" + selectedtopic)

         .then(function(response){
         return response.json();
         })

         .then(function(data){


        quizquestions = data;

         loadquestion();

         });

          }

         function loadquestion() {

            const data = quizquestions[currentquestion];

                clearInterval(timer);

                timeleft = 10;

              document.getElementById("timer").innerText =
                 "Time Left: " + timeleft; 
                               
                     timer = setInterval(function(){

                     timeleft--;

               document.getElementById("timer").innerText =
                 "Time Left: " + timeleft;

                 

                 if(timeleft <= 0){
                    clearInterval(timer)
                    nextquestion()
                 }},1000);

                document.getElementById("counter").innerText =
              "Question " + (currentquestion + 1) + " / 5";
            
              document.getElementById("nextbtn").disabled=true;

                document.getElementById("result").innerText="";

                document.getElementById("result").style.color="black";

                document.getElementById("question").innerText =
                    data.question;
                

                document.getElementById("options").innerHTML =
                `
                    <button class="optionbtn"
                     onclick="checkanswer('${data.option1}', '${data.answer}')">
                        ${data.option1}
                        </button>
                   <button class="optionbtn"
                   onclick="checkanswer('${data.option2}', '${data.answer}')">
                       ${data.option2}
                       </button>

                   <button class="optionbtn"
                   onclick="checkanswer('${data.option3}', '${data.answer}')">
                       ${data.option3}
                       </button>
                       
                    <button class="optionbtn"
                    onclick="checkanswer('${data.option4}', '${data.answer}')">
                       ${data.option4}
                       </button>
               `        
        }
            function checkanswer(selected, correct) {

              clearInterval(timer);


              let buttons=document.querySelectorAll(".optionbtn")

              buttons.forEach(function(btn){
                btn.disabled = true; 
              });
            
                if(selected === correct) {

                  correctsound.play();
                document.getElementById("result").innerText="correct";
                score++;

                document.getElementById("result").style.color="green";

                document.getElementById("score").innerText="score:"+score;

                document.getElementById("score").classList.remove('score-flash');
           void document.getElementById("score").offsetWidth;
           document.getElementById("score").classList.add('score-flash');

            }
              else{

                wrongsound.play();
                document.getElementById("result").innerText="wrong";

                document.getElementById("result").style.color="red";
              }

              buttons.forEach(function(btn){
                btn.disabled = true; 
                if(btn.innerText===correct)
                  {
                  btn.classList.add('correct');
                }
                else if(btn.innerText===selected)
                {
                  btn.classList.add('wrong');
                }
            });
         
                setTimeout(function(){
                    nextquestion()
                },1000);
                }
            
              function nextquestion(){
                if(currentquestion < 4){
                currentquestion++;
                loadquestion();
              }
              else{

                fetch("/updatescore", {

                

              method: "POST",

           headers: {
               "Content-Type":"application/json"
            },

          body: JSON.stringify({

        username: loggedinuser,

        score: score

       })

        });

           loadleaderboard();

           let percentage=(score/5)*100;

            document.getElementById("question").innerHTML ="🏆 Quiz Finished";

            if(score === 5){

            document.getElementById("result").innerHTML =
           "Perfect Score 🔥<br>Score: " + score +
            "/5 <br>Percentage: " + percentage +"%";
            }

           else if(score >= 3){

           document.getElementById("result").innerHTML =
         "Excellent Work 😄<br>Score: " + score +
          "/5<br>Percentage: " + percentage + "%";

}

      else {

            document.getElementById("result").innerHTML =
                "Keep Practicing 💪<br>Score: " + score + 
                "/5<br>percentage:"+ percentage+ "%";

}
            document.getElementById("nextbtn").disabled=true;
}
              }
              function restartquiz(){


                clearInterval(timer)
                 score=0;
                 currentquestion=0;
                 quizquestions=[];
                 selectedtopic="";

               document.getElementById("timer").innerText="";

              document.getElementById("counter").innerText="";   

             document.getElementById("score").innerText="score:"+score;
            
              document.getElementById("result").innerText="";

              document.getElementById("startbtn").style.display =
        "block";
        document.getElementById("quizbox").scrollTop=0;

         document.getElementById("question").innerText="";

         document.getElementById("options").innerHTML="";

         document.getElementById("topics").style.display="none";

         document.getElementById("topicname").innerText="";

         document.getElementById("nextbtn").disabled=true;
               
              }

              function loadleaderboard(){

            fetch("/leaderboard")

           .then(function(response){
             return response.json();
           })

          .then(function(data){

           let html = "";

              data.forEach(function(user,index) {
                
                let medal="";

                if(index === 0){
                  medal="🥇";
                }
                else if(index === 1){
                  medal="🥈";
                }
                else if(index === 2){
                  medal="🥉";
                }


            html +=
            `
            <div class="leadercard">
            <h3>${medal}${user.name}</h3>
            <p>Score:${user.score}</p>
            </div>
            `
              });
             

           document.getElementById("leaderboard").innerHTML =
              html;

           });

           }

           function darkmode(){
            document.body.classList.toggle("dark");

      let btn = document.querySelector("#quizbox > button:first-child");
      let isDark = document.body.classList.contains("dark");
      btn.innerText = isDark ? "Light Mode☀️" : "Dark Mode🌑";
}