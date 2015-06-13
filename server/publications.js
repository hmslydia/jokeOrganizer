//Starting Data
Meteor.publish('articles', function(){
  return Articles.find()
})

Meteor.publish('voices', function(){
  return Voices.find()
})

//Input Data
Meteor.publish('comments', function(){
  return Comments.find()
})


Meteor.publish('tags', function(){
  return Tags.find()
})

Meteor.publish('tagApplications', function(){
  return TagApplications.find()
})



Meteor.publish('likerts', function(){
  return Likerts.find()
})

Meteor.publish('likertApplications', function(){
  return LikertApplications.find()
})