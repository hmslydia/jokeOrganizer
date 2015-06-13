Template.insultGoal.helpers({
  tally : function(){
    var numTotal = Articles.find().count() * 3
    
    var tagApps = TagApplications.find().fetch()
    var voices = _.groupBy(tagApps, function(app) {
      return app.article_id+"_"+app.field
    })
    
    var numYes = 0
    var numNo = 0
    var numYesOrNo = 0
    _.each(voices, function(voiceObj){
      var tags = _.flatten( _.pluck(voiceObj, "tag"))

      var hasAnswer = false
      if( _.contains(tags, "#insult")){
        numYes++
        var hasAnswer = true
      }
      if( _.contains(tags, "#notInsult")){
        numNo++
        var hasAnswer = true
      }
      if(hasAnswer){
        numYesOrNo++
      }
    })
    
    return {
        numTotal: numTotal, 
        numYes: numYes,
        numNo: numNo,
        numUnsure: numTotal - numYesOrNo
    }    
  }
})

Template.insultGoal.events({
  'click #insultGoalYes': function(event){
    query("goal", 
      {
        queryGoalType: "insult",
        queryGoalSubtype: "yes"
      }
    )
  },
  'click #insultGoalNo': function(event){
    query("goal",
      {
        queryGoalType: "insult",
        queryGoalSubtype: "no"
      }
    )
  },
  'click #insultGoalUnsure': function(event){
    query("goal", 
      {
        queryGoalType: "insult",
        queryGoalSubtype: "unsure"
      }
    )
  }
})


Template.twoStoryGoal.helpers({
  tally : function(){
    var twoStoryGoal = Likerts.findOne({label:"two-stories"})
    
    var numYes = twoStoryGoal.count_yes
    var numNo = twoStoryGoal.count_no    
    var numKinda = twoStoryGoal.count_kinda
    
    //THIS IS ACTUALLY WRONG. JUST AN ESTIMATE
    // It is only correct if 
    var numTotal = Voices.find().count()
    var numNotDone = numTotal - (numYes + numNo + numKinda)
    
    return {
        //numTotal: numTotal, 
        numYes: numYes,
        numKinda: numKinda,
        numNo: numNo,
        numNotDone: numNotDone,
    }    
  }
})

Template.twoStoryGoal.events({
  'click #twoStoryGoalYes': function(event){
    query("goal", 
      {
        queryGoalType: "likert-two-stories",
        queryGoalSubtype: "yes"
      }
    )
  },
  'click #twoStoryGoalNo': function(event){
    query("goal",
      {
        queryGoalType: "likert-two-stories",
        queryGoalSubtype: "no"
      }
    )
  },
  'click #twoStoryGoalKinda': function(event){
    query("goal", 
      {
        queryGoalType: "likert-two-stories",
        queryGoalSubtype: "kinda"
      }
    )
  },
  
  'click #twoStoryGoalNotDone': function(event){
    console.log('coick not done')
    query("goal", 
      {
        queryGoalType: "likert-two-stories",
        queryGoalSubtype: "notDone"
      }
   )
   }
})