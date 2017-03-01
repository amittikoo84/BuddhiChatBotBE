import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import request from 'request';

import AIMLInterpreter from 'AIMLInterpreter';

var aimlInterpreter = new AIMLInterpreter({name:'Buddhi', age:'42'});
aimlInterpreter.loadAIMLFilesIntoArray(['./alice/ai.aiml.xml', './alice/alice.aiml.xml','./alice/astrology.aiml.xml','./alice/atomic.aiml.xml','./alice/badanswer.aiml.xml','./alice/bot.aiml.xml','./alice/bot_profile.aiml.xml','./alice/client.aiml.xml',
    './alice/client_profile.aiml.xml','./alice/computers.aiml.xml','./alice/continuation.aiml.xml','./alice/date.aiml.xml','./alice/default.aiml.xml','./alice/emotion.aiml.xml','./alice/food.aiml.xml',
    './alice/history.aiml.xml','./alice/humor.aiml.xml','./alice/imponderables.aiml.xml','./alice/inquiry.aiml.xml','./alice/interjection.aiml.xml','./alice/iu.aiml.xml','./alice/knowledge.aiml.xml',
    './alice/money.aiml.xml','./alice/personality.aiml.xml','./alice/pickup.aiml.xml','./alice/pyschology.aiml.xml','./alice/religion.aiml.xml','./alice/stories.aiml.xml','./alice/that.aiml.xml','./alice/update1.aiml.xml','./alice/update_mccormick.aiml.xml','./alice/xfind.aiml.xml',
    './alice/biography.aiml.xml','./alice/gossip.aiml.xml','./alice/loebner10.aiml.xml','./alice/mp0.aiml.xml','./alice/mp1.aiml.xml','./alice/mp2.aiml.xml','./alice/mp3.aiml.xml','./alice/mp4.aiml.xml','./alice/mp5.aiml.xml','./alice/mp6.aiml.xml'
    ]);

var callback = function(answer, wildCardArray, input){
    console.log(answer + ' | ' + wildCardArray + ' | ' + input);
};

export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

    api.post('/buddhi', (req, res) => {
        var human = req.body.question;
        console.log(human)
        aimlInterpreter.findAnswerInLoadedAIMLFiles(human, (answer, wildCardArray, input) => {
            console.log(answer + ' | ' + wildCardArray + ' | ' + input);
            return res.json(answer);
        });

    });


    api.get('/pageSpeed', (req, res) => {



        var username = 'atikoo';
        var password = 'P@ssw0r2';
        const options = {
            url: 'https://www.googleapis.com/pagespeedonline/v2/runPagespeed?url=https://www.americanexpress.com/us/credit-cards/card/platinum/',
            method: 'GET',
            json: true,
            auth: {
                user: username,
                password: password
            },
            rejectUnauthorized: false,
            requestCert: true,
            agent: false
        };

        request(options, function(err, response, body) {
            if (err) {
                console.dir(err)

                return res.send("Error Occured1");
                //res.end();
            }
            var pageSpeed = {};
            pageSpeed.score = body.ruleGroups.SPEED.score;
            pageSpeed.stats = body.pageStats;
            pageSpeed.title = body.title;

            let ruleResults = body.formattedResults.ruleResults;

            for(let i =0; i < ruleResults.length; i++) {
                let rule = ruleResults[i];

            }
            let rules = new Array();

            for (var key in ruleResults) {
                if (ruleResults.hasOwnProperty(key)) {
                    var val = ruleResults[key];
                    let rule = {};
                    rule.name = val['localizedRuleName'];
                    rule.impact = Math.round(val['ruleImpact']);
                    rules.push(rule);
                }
            }
            pageSpeed.rules = rules;


            res.setHeader("Cache-Control", "public, max-age=1200");
            res.setHeader("Expires", new Date(Date.now() + (1200 * 1000)).toUTCString());

            return res.json(pageSpeed);
        });

    });


	api.get('/build', (req, res) => {

        var lastBuildInfo = {};

        var username = 'username';
        var password = 'password';
        var options = {
            url: 'JENKINS_URL/api/json',
            auth: {
                user: username,
                password: password
            },
            json:true
        }

        request(options, function (err, response, body) {
            if (err) {
                console.dir(err)
                return res.send("Error Occured");
            }
            var lastBuildURL = body.lastBuild.url + 'api/json';


            options = {
                url: lastBuildURL,
                auth: {
                    user: username,
                    password: password
                },
                json:true
            }

            request(options, function (err, response, body) {
                if (err) {
                    console.dir(err)
                    res.send("Error Occured");
                    res.end();
                }

                lastBuildInfo.status = body.result;


                // Create a new JavaScript Date object based on the timestamp
                // multiplied by 1000 so that the argument is in milliseconds, not seconds.
                var date = new Date((body.timestamp)*1000);
                // Hours part from the timestamp
                var hours = date.getHours();
                // Minutes part from the timestamp
                var minutes = "0" + date.getMinutes();
                // Seconds part from the timestamp
                var seconds = "0" + date.getSeconds();

                // Will display time in 10:30:23 format
                var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

                lastBuildInfo.timestamp = formattedTime;

                var changes = new Array();

                for(var i =0; i < body.changeSet.items.length; i++){
                    //console.log(body.changeSet.items[i]);

                    var change = {}, item = body.changeSet.items[i];
                    change.name = item.author.fullName;
                    change.comment = item.comment;
                    changes.push(change);
                }
                lastBuildInfo.changes = changes;
                res.setHeader("Cache-Control", "public, max-age=1200");
                res.setHeader("Expires", new Date(Date.now() + (1200 * 1000)).toUTCString());
                res.json(lastBuildInfo);

            });


        });
	});

	return api;
}
