
const mongoose = require('mongoose');
const { Schema } = mongoose;

const exercisesSubSchema = new Schema(
    {
       // id: { type: String, required: true},
        description: { type: String, required: true},
        duration: { type: Number, required: true},
        date: String
    }
    , { _id : false }
);

const userSchema = new Schema(
    {
        username: {type: String, required: true}
    }
    
)

/* This one creates an _id in the log entry, not suitable 
   according to the specs, use the one below instead

   see: {_id: false}
   
const userExercisesSchema = new Schema(
    {
        username: {type: String, required: true},
        count: Number,
        log: [{
                description: String,
                duration: Number,
                date: Date
        }]
    }
)

*/


/* https://stackoverflow.com/questions/17254008/stop-mongoose-from-creating-id-property-for-sub-document-array-items */
const userExercisesSchema = new Schema(
    {
        username: {type: String, required: true},
        count: Number,
        log: [exercisesSubSchema]
    } 
)


let User = mongoose.model('User',userSchema);
let UserExercises = mongoose.model('UserExercises',userExercisesSchema);

module.exports = {

    mongoDbConnect: function() {
        mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    },

    createANewUser: function (input, done) {
    
        User.findOne({ username: input }, (err, data) => {
            if (err || data === null) {
                let userDoc = new User({username: input});
                userDoc.save((err,data) => err? done(err,'Path `username` is required.'): done(null,data));
            } else {
                done(null,data);
            }
        });
/*
        let userDoc = new User({username: input});
        userDoc.save((err,data) => err? done(err): done(null,data));
*/
    },

    addExercises: function (_id, description, duration, date, done) {

        let dateval =new Date(date).toDateString();
        User.findById(_id, (err, data) => {
            if (err) {
                done(err);
            } else {
                UserExercises.findOne({ username: data.username}, (erruserexerc, userexerc) => {
                    if (erruserexerc || userexerc === null) {

                        //var formatDate = new Date(date);
                        //var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
                        /* https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date */
                        // console.log(formatDate.toLocaleDateString("en-US", options));
                       /* https://stackoverflow.com/questions/67177522/remove-comma-from-date-which-is-generated-from-intl-datetimeformat */
                        //formatDate.replace(/, /g, " "); //  a simple replace removes the comma
                        //console.log(formatDate);
                        let userExercisesDoc = new UserExercises(
                            {
                                username: data.username,
                                count: 1,
                                log: [{description: description,
                                        duration: duration,
                                        date: dateval}]
                            });
                            userExercisesDoc.save((erruserexerc,userexerc) => erruserexerc? done(erruserexerc): done(null,userexerc));
                    } else {
                        userexerc['log'].push({
                            description: description,
                            duration: duration,
                            date: dateval
                        });
                        userexerc['count'] = userexerc['count'] + 1;
                        userexerc.save((erruserexerc, userexerc) => (erruserexerc? done(erruserexerc) : done(null, userexerc)));
                    }

                });

            }
        })
    }, 

    getUserExerciseLog: function (_id, from, to, limit, done) {

     if (from)
        frompar =  new Date(new Date(from).toDateString());
    else 
        topar = null
     if (to)
        topar =  new Date(new Date(to).toDateString());
     else 
        topar = null   


        User.findById(_id, (err, data) => {
            if (err === null && data!== null) {

                UserExercises
                .findOne({"username": data.username}).lean()
                    .exec(function(err2, data2)
                        {
                            /* findOne.lean() is key to be able to check json */
                            logs = data2.log;
                            let i=0;
                            let logsadded=0;
                            let newlogs = [];
                            let loopended = false;
                            while (i<logs.length && !loopended) {
                                log = logs[i];
                                let fromok = false;
                                let took = false;
                                if (from) {
                                    if (new Date(log.date).getTime()>=frompar.getTime()) {
                                        fromok=true;
                                    }
                                } else {
                                    fromok=true;
                                }
                                if (to) {
                                    if (new Date(log.date).getTime()<=topar.getTime()) {
                                        took=true;
                                    }
                                } else {
                                    took=true;
                                }
                                if (fromok && took && 
                                        ((!limit) || (limit && logsadded<limit))) {
                                    newlogs[logsadded] = log;
                                    logsadded=logsadded+1;
                                }
                                if (limit && logsadded >= limit) loopended = true;

                                i++;

                            }

                            data2.log = newlogs;


                            if(err2)
                            { 
                              //  console.log('err2: '+err2);
                                done(err2) ;
                            }
                            else { 
                             //   console.log('data2: '+data2);
                                done(null,data2);
                            }

                        }
                    )
/*
                .aggregate([
                    {$match: { username: data.username }},
                    { $project: {
                            log: {$filter: {
                                    input: '$log',
                                    as: 'item',
                                    cond: {$eq: ['$$item.description', 'asdf']}
                                    }
                                    },
                                }},
                    { $project: {
                            log: {$filter: {
                                    input: '$log',
                                    as: 'item',
                                    cond: {$eq: ['$$item.duration', 12]}
                                 }}
                        }}
                        
                        ,
                    { $project: {
                            log: {$filter: {
                                    input: '$log',
                                    as: 'item',
                                    cond: {$gte: ['$dateFromString: {$$item.date}', (from)?(new Date('2020-09-20T07:00:00.000Z')):null]}
                                 }}
                        }}
                    ], (err2,data2) => (err2)?done(err2):done(null,data2))
                */
               
                    
                        /*
                     ,
                        { $project: {
                            log: {$filter: {
                                    input: '$log',
                                    as: 'item',
                                    cond: {$lte: [Date('$$item.date'), (topar)?topar:null]}
                                 }}
                        }}*/
                   
             
                
                
                
                
                /*
                find({username: data.username})
                    .exec(function(err2, data2)
                        {

                            if(err2) done(err2) ;
                            else done(null,data2);

                        }
                    )

*/

            } else if (data!== null) {
                done(err);
            } else {
                done(err);
            }


                /*
                //it would also work with data['username']
                UserExercises.findOne({ username: data.username }, (err2, data2) => (err2 ? done(err2) : done(null, data2)));
                */

                /*
                UserExercises
                .aggregate([
                    {$match: { username: data.username }},
                    {$unwind: "$log"},
                    {$match: {"log.description": "asdf"}},
                    {$group: {"_id": "$_id",}}
                ])

                .exec((err2, data2) => (err2 ? done(err2) : done(null, data2)));
*/



/*
.aggregate([
    {$match: { username: data.username }},
    { $project: {
            log: {$filter: {
                    input: '$log',
                    as: 'item',
                    cond: {$eq: ['$$item.description', 'asdf']}
                    }
                    },
                }},
    { $project: {
            log: {$filter: {
                    input: '$log',
                    as: 'item',
                    cond: {$eq: ['$$item.duration', 12]}
                 }}
        }}
        
        ,
    { $project: {
            log: {$filter: {
                    input: '$log',
                    as: 'item',
                    cond: {$gte: ['new Date($$item.date)', (from)?(new Date('2020-09-20T07:00:00.000Z').toISOString()):null]}
                 }}
        }}

        */
        /*
     ,
        { $project: {
            log: {$filter: {
                    input: '$log',
                    as: 'item',
                    cond: {$lte: [Date('$$item.date'), (topar)?topar:null]}
                 }}
        }}*/
   /*
    ])

.exec((err2, data2) => (err2 ? done(err2) : done(null, data2)));
*/




            
        })

        /*
            Person.find({ favoriteFoods: foodToSearch })
            .sort({ name: 'asc'})
            .limit(2)
            .select('-age')
            .exec((err, data) => (err ? done(err) : done(null, data)));
        */

    },

    getOnlyOneUser: function (input, done) {
        User.findOne({ username: input }, (err, data) => (err ? done(err) : done(null, data)));
    }

}