var request = require('request');
module.exports.initSocketService = function(app, io) {

    function removeUser(userId, connectionId) {
        delete app.locals.appData.activeConnections[connectionId];
        if (userId) {
            delete app.locals.appData.activeUserDetails[userId];
        }
    }

    function addUser(userJSONObj, connectionId) {

        var userConnectionObj = {};
        userConnectionObj["connectionId"] = connectionId;
        delete userJSONObj["type"];
        userConnectionObj["userDetails"] = userJSONObj;
        app.locals.appData.activeUserDetails[userJSONObj.uid] = userConnectionObj;
        app.locals.appData.activeConnections[connectionId] = userJSONObj.uid;
        app.locals.serverToken = userJSONObj.token;
        app.locals.serviceURL = userJSONObj.serverBaseUrl;


    }

    function sendAllActiveUsersList() {

        var activeuserListTemplate = app.locals.appData.activeUserListTemplate;
        activeuserListTemplate.data = [];
        for (var key in app.locals.appData.activeUserDetails) {
            activeuserListTemplate.data.push(app.locals.appData.activeUserDetails[key]["userDetails"]);
        }
        io.emit('message', activeuserListTemplate);

    }

    function processMessage(message) {
        var messageType = message.type;
        //challenge request
        if (messageType === 'C_REQ') {
            processChallengeRequest(message);
            //challenge response - accept or reject
        } else if (messageType === 'C_RESP') {
            processChallengeAcceptReq(message);
            //question request
        } else if (messageType === 'Q_REQ') {
            var challengeId = message.challengeid;
            var challengeDetails = app.locals.appData.challengeDetails[challengeId];
            sendQuestion(challengeDetails, message.nextIndex);
            //previous question answer response and requesting for next question.
        } else if (messageType === 'A_REQ') {
            processAnswer(message);
        } else if (messageType === 'CC_REQ') {
            processChallengeCompletion(message);
        } else if (messageType === 'TEST_REQ') {

            callQuizApi('Computer Science', function(data) {
                console.log("Data returedd");
                console.log(data);

            })
            //
        }
    }

    function processChallengeCompletion(message) {
        //{"type":"CC_REQ","challengeId":"12345","quizId":"1234","uid":"123","topic":"CS","totalScore":""}
        var challengeDetails = app.locals.appData.challengeDetails[message.challengeId];
        var user = {};
        user[message.uid] = message.totalScore

        if (challengeDetails.challengeResponse.challengeCompletionStatus) {
            challengeDetails.challengeResponse.challengeCompletionStatus.push(user);
            var user1ConnectionId = app.locals.appData.activeUserDetails[challengeDetails.challengedBy.uid].connectionId;
            var user2ConnectionId = app.locals.appData.activeUserDetails[challengeDetails.opponentuid].connectionId;
            app.locals.appData.challengeDetails[message.challengeId] = challengeDetails;
            io.to(user1ConnectionId).emit('message', {
                "type": "CC_RESP"
            });
            io.to(user2ConnectionId).emit('message', {
                "type": "CC_RESP"
            });
        } else {
            challengeDetails.challengeResponse.challengeCompletionStatus = [];
            challengeDetails.challengeResponse.challengeCompletionStatus.push(user);
        }


        var connectionId = app.locals.appData.activeUserDetails[message.uid].connectionId;

    }

    function processAnswer(message) {
        var challengeId = message.challengeId;
        var challengeDetails = app.locals.appData.challengeDetails[challengeId];
        var challengeResponse = challengeDetails.challengeResponse;
        saveSelectedAnswer(message, challengeResponse);
    }

    function saveSelectedAnswer(answerResp, challengeResponse) {

        var challengeResp = {
            uid: answerResp.uid,
            questionId: answerResp.questionId,
            optionId: answerResp.optionId,
            isAnswered: answerResp.isAnswered,
            time: answerResp.time
        };
        var questionId = answerResp.questionId;
        var challengeId = answerResp.challengeId;
        var challengeDetails = app.locals.appData.challengeDetails[challengeId];
        var question = challengeDetails.challengeResponse[questionId];
        if (question == undefined) {
            challengeDetails.challengeResponse[questionId] = [];
            challengeDetails.challengeResponse[questionId].push(challengeResp);
        } else {
            challengeDetails.challengeResponse[questionId].push(challengeResp);
            var questionIndex = challengeDetails.questionIndex;
            var quizObj = app.locals.appData.challengeDetails[challengeId]["quizDetails"];
            var options = app.locals.appData.challengeDetails[challengeId]["quizDetails"]["questions"][questionIndex].options;
            var correctOptionId = "";
            for (var i = 0; i < options.length; i++) {
                if (options[i].isCorrect) {
                    correctOptionId = options[i].id;
                }
            }

            var resp1 = challengeDetails.challengeResponse[questionId][0];
            var resp2 = challengeDetails.challengeResponse[questionId][1];

            if (resp1.optionId == correctOptionId) {
                resp1.score = 11 - resp1.time;
            } else {
                resp1.score = 0;
            }

            if (resp2.optionId == correctOptionId) {
                resp2.score = 11 - resp2.time;
            } else {
                resp2.score = 0;
            }
            challengeDetails.challengeResponse[questionId][0] = resp1;
            challengeDetails.challengeResponse[questionId][2] = resp2;
            var answerObj = {
                questionId: answerResp.questionId,
                id: correctOptionId
            };
            var scores = {};
            scores[resp1.uid] = resp1.score;
            scores[resp2.uid] = resp2.score
            answerObj["scores"] = scores;
            //update table
            challengeDetails.questionIndex++;
            app.locals.appData.challengeDetails[challengeId] = challengeDetails;
            var index = questionIndex + 1;
            if (index < 5) {
                sendQuestion(challengeDetails, index, answerObj)
            }
        }
    }

    function processChallengeAcceptReq(message) {
        var challengeId = message.challengeId;
        //getting challenge details from db.
        var challengeDetails = app.locals.appData.challengeDetails[challengeId];
        if (message.accepted) {
            callQuizApi('Computer Science', function(data) {
                var quizObj = data;
                //update quizid
                app.locals.appData.challengeDetails[challengeId]["quizId"] = quizObj.id;
                app.locals.appData.challengeDetails[challengeId]["quizDetails"] = quizObj;
                sendQuestion(challengeDetails, 0);
            });

        } else {
            var challengeAcceptResp = app.locals.appData.challengeAcceptResp;
            //get data from DB.

            //update DB with challenge request status.
            app.locals.appData.challengeDetails[challengeId]["accepted"] = false;

            var respBody = {
                "opponentId": challengeDetails.opponentuid,
                "opponentName": challengeDetails.opponentName,
                "topic": challengeDetails.topic
            }
            challengeAcceptResp.data = [];
            challengeAcceptResp.data.push(respBody);
        }

    }

    function sendQuestion(challengeDetails, index, answerObj) {
        var challengeId = challengeDetails.challengeId;
        //get both user id uing challenge id from db.
        var user1ConnectionId = app.locals.appData.activeUserDetails[challengeDetails.challengedBy.uid].connectionId;
        var user2ConnectionId = app.locals.appData.activeUserDetails[challengeDetails.opponentuid].connectionId;
        //get Quiz from db and store inside challenge. 

        var fistQuestion = app.locals.appData.challengeDetails[challengeId]["quizDetails"]["questions"][index]
        //prepare question format for UI
        var questionRespTemplate = app.locals.appData.questionRespTemplate;
        questionRespTemplate.data = [];

        var questionObj = {
            "challengeId": challengeId,
            "id": fistQuestion.id,
            "description": fistQuestion.description,
            "options": []
        };

        var options = fistQuestion.options;
        for (var i = 0; i < options.length; i++) {
            var optionObj = {
                id: options[i].id,
                value: options[i].value
            };
            questionObj.options.push(optionObj);
        }
        var resp = {
            question: questionObj,
            prevAns: answerObj
        };
        questionRespTemplate.data.push(resp);
        io.to(user1ConnectionId).emit('message', questionRespTemplate);
        io.to(user2ConnectionId).emit('message', questionRespTemplate);
    }

    //processing chellenge request user form user.
    function processChallengeRequest(challenge) {

        var obj = {
            "type": "challenge",
            "opponentuid": challenge.opponentuid,
            "opponentName": challenge.opponentName,
            "challengeId": challenge.challengeId,
            "description": "",
            "challengedBy": {
                "uid": challenge.uid,
                "userName": challenge.userName
            },
            "topic": challenge.topic,
            "challengeResponse": {},
            "questionIndex": 0
        };
        var challenge = saveChallengeRequest(obj);
        var responseBody = app.locals.appData.challengeRespTemplate;
        responseBody.data = [];
        responseBody.data.push(obj);
        var opponentConnectionId = app.locals.appData.activeUserDetails[challenge.opponentuid].connectionId
        io.to(opponentConnectionId).emit('message', responseBody);
    }
    //save challenge request to db and get challenge id
    function saveChallengeRequest(reqObj) {
        var ChallengeId = app.locals.appData.challengeDetails.fakeChallengeId++;
        delete reqObj["type"];
        reqObj["challengeId"] = ChallengeId;
        app.locals.appData.challengeDetails[ChallengeId] = reqObj;
        return app.locals.appData.challengeDetails[ChallengeId];
    }

    function callQuizApi(subject, callback) {
        // var subject='Computer Science';
        var options = {
            url: app.locals.serviceURL + 'quiz/' + subject,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': app.locals.serverToken
            }
        };

        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(getQuizData(body)); // Print the google web page.
                if (typeof callback === 'function') {
                    callback(getQuizData(body));
                }
            } else {
                console.log(body)
            }
        })
    }

    function getQuizData(response) {


        var quizObj = {};
        var data = JSON.parse(response);
        quizObj["id"] = data[0].quiz_id;
        quizObj["questions"] = [];
        var sortedObj = sortResponseBasedOnQuestion(data);

        console.log(quizObj);
        for (var key in sortedObj) {
            quizObj["questions"].push(sortedObj[key]);
        }
        return quizObj;
    }

    function sortResponseBasedOnQuestion(data) {
        var quizObj = {};
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            var questionObj = {};
            var optionObj = {};
            optionObj["id"] = obj.option_id;
            optionObj["value"] = obj.option;
            optionObj["isCorrect"] = obj.correct_flag == '1' ? true : false;

            if (quizObj[obj.question_id]) {

                if (quizObj[obj.question_id]["options"]) {
                    quizObj[obj.question_id]["options"].push(optionObj);
                } else {
                    quizObj[obj.question_id]["options"] = [];
                    quizObj[obj.question_id]["options"].push(optionObj);
                }
            } else {
                quizObj[obj.question_id] = {};
                quizObj[obj.question_id]["options"] = [];
                quizObj[obj.question_id]["options"].push(optionObj);

            }

            quizObj[obj.question_id]["id"] = obj.question_id;
            quizObj[obj.question_id]["description"] = obj.question;

        }
        return quizObj;
    }

    return {
        processMessage: processMessage,
        removeUser: removeUser,
        addUser: addUser,
        sendAllActiveUsersList: sendAllActiveUsersList
    };

}