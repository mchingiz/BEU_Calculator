const studentForm = $('.ui.studentForm');
const grades = $('#grades');
const gradesTable = $('#grades table');
const loader = $('#loader');
const errorBox = $("#errorBox");

var jokeInterval;
var serverTimeout;

function populateTable(subjects){
    for(var i=0;i<subjects.length;i++){
        // console.log(subjects[i].name);

        var targetScores = calculateTargetPoints(subjects[i]);

        var $subjectTR = $("<tr>")
            .append($("<td>").text(subjects[i].code))
            .append($("<td>").text(subjects[i].ects))
            .append($("<td>").text(subjects[i].name))
            .append($("<td>").text(subjects[i].sdf1))
            .append($("<td>").text(subjects[i].sdf2))
            .append($("<td>").text(subjects[i].sdf3))
            .append($("<td>").text(subjects[i].ff))
            .append($("<td>").text(subjects[i].dvm))
            .append($("<td>").text(subjects[i].fnl))
            .append($("<td class='bold'>").text(subjects[i].avg))

        if(subjects[i].avg == ""){ // Subject is not complete
            $subjectTR.append($("<td>").text(targetScores["51"]))
                    .append($("<td>").text(targetScores["71"]))
                    .append($("<td>").text(targetScores["91"]))
        }else if(subjects[i].avg >= 51){ // Subject is passed
            $subjectTR.append($("<td>").attr("colspan","3").addClass("center aligned passedSubject").html("passed"))
        }else if(subjects[i].avg < 51){ // Subject failed
            $subjectTR.append($("<td>").attr("colspan","3").addClass("center aligned failedSubject").html("failed"))
        }


        // console.log($subjectTR);
        gradesTable.find("tbody").append($subjectTR);
    }
}

function calculateTargetPoints(subject){
    var res = {};

    if(subject.avg != ""){ // Then subject is complete, no need to calculate target points
        return res;
    }

    var entryPoint = 0;

    subject.sdf1 !== ( "Q" || "" ) ? entryPoint += subject.sdf1/10 : entryPoint += 0;
    subject.sdf2 !== ( "Q" || "" ) ? entryPoint += subject.sdf2/10 : entryPoint += 0;
    subject.sdf3 !== ( "Q" || "" ) ? entryPoint += subject.sdf3/10 : entryPoint += 0;
    subject.ff !== ( "Q" || "" ) ? entryPoint += subject.ff/10 : entryPoint += 0;
    subject.dvm !== ( "Q" || "" ) ? entryPoint += subject.dvm/10 : entryPoint += 0;

    // console.log(subject.name + ': ' + entryPoint);

    // First store value as float
    res["51"] = (50.5-entryPoint)*2;
    res["71"] = (70.5-entryPoint)*2;
    res["91"] = (90.5-entryPoint)*2;

    // If any target point is bigger than 100, change value with "-"
    // If not round target point
    res["51"] > 100 ? res["51"] = "-" : res["51"] = Math.round(res["51"]);
    res["71"] > 100 ? res["71"] = "-" : res["71"] = Math.round(res["71"]);
    res["91"] > 100 ? res["91"] = "-" : res["91"] = Math.round(res["91"]);

    return res;
}

$('.ui.form').form({
    inline: true,
    fields: {
        username: {
            identifier: 'username',
            rules: [
                {
                    type: 'empty',
                    prompt: 'Zəhmət olmasa tələbə nömrənizi yazın'
                },
                {
                    type: 'exactLength[9]',
                    prompt: 'Tələbə nömrəsinin uzunluğu 9 simvol olmalıdır'
                }
            ]
        },
        password: {
            identifier: 'password',
            rules: [{
                type: 'empty',
                prompt: 'Zəhmət olmasa parolunuzu yazın'
            }]
        }
    },
    onSuccess: function(event, fields) {

        var username = studentForm.find("input[name=username]").val();
        var password = studentForm.find("input[name=password]").val();

        loader.hide();
        grades.hide();
        errorBox.hide();

        var validationResult = studentForm.form('is valid');

        if(validationResult){
            // console.log('asdf');

            loader.show();

            clearTimeout(serverTimeout);
            jokeInterval = setInterval(changeLoadingText,5000);
            serverTimeout = setTimeout(errorOnServerSide, 35000);

            userData = {
                username: username,
                password: password,
                lang: "az"
            }

            $.ajax({
    			type: 'POST',
    			data: JSON.stringify(userData),
    	        contentType: 'application/json',
                url: 'http://localhost:3000/getData',
                success: function(data) {
                    console.log(data);

                    if(data.statusCode == 200){
                        console.log('--- DATA ---');
                        console.log(data);
                        clearTimeout(serverTimeout);

                        gradesTable.find("tbody").empty();
                        populateTable(data.subjects);
                        grades.show();
                    }else{
                        errorBox.find(".header").text(data.error);
                        errorBox.show();
                    }

                    loader.hide();

                    clearInterval(jokeInterval);
                }
            });
        }

        event.preventDefault();
    }
});

var jokeNumber = 0;

function changeLoadingText(){
    var currentJoke = $(".ui.massive.text.loader");

    // console.log("currentJoke: "+currentJoke)

    while(currentJoke.text() == kindaFunny[jokeNumber]){
        jokeNumber = Math.floor(Math.random() * kindaFunny.length);
        // console.log(jokeNumber.text());
    }

    // console.log("newJoke: "+kindaFunny[jokeNumber])

    currentJoke.text(kindaFunny[jokeNumber]);
}

function errorOnServerSide(){
    errorBox.find(".header").text("Səbəbini bilmədiyimiz bir problem baş verdi, zəhmət olmasa yenidən yoxla");
    loader.hide();
    grades.hide();
    errorBox.show();
}

var kindaFunny = [
    "Biraz daha gözlə",
    "Vaxtını da alırıq, üzrlü say",
    "Hesablayırıq",
    "Qiymətlərin də qiymət ola",
    "Bu gedişlə təqaüdə də düşməzsən sən",
    "Başın var amma oxumursan",
    "Camaatın uşağı qiymət hesablamadan girir imtahana",
    "Uzaqbaşı gələn il girərsən",
    "Deyirlər yay məktəbinin də qiymətləri qalxacaq",
    "Biraz da bəxt işidi bu qiymət məsələsi,ürəyinə salma",
]

var exampleData = [
    {
        // entryPoint = 40.4, so getting an A is impossible
        // After increasing 'dvm' point by 1, getting an A will be possible(with 100 hunred points from final)
        name: "Data Structures and Algorithms",
        ects: "6",
        code: "COMP 202",
        sdf1: "100",
        sdf2: "100",
        sdf3: "100",
        abs: "100",
        ff: "100",
        dvm: "4",
        fnl: "",
        avg: "",
    },{
        name: "Numerical Analysis",
        code: "COMP 305",
        abs: "5",
        avg: "58",
        ects: "6",
        dvm: "30",
        ff: "170",
        fnl: "190",
        sdf1: "30",
        sdf2: "10",
        sdf3: "400",
    }
]

// testTable();
//
// function testTable(){
//     grades.show();
//     populateTable(exampleData);
// }
