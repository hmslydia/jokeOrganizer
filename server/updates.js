addLikertResponse = function(label){
  console.log("addLikertResponse")
  //insert into Likerts
  var likertObj = {
    label: label,
    count_done: 0,
    
    count_yes: 0,
    count_no: 0,
    count_kinda: 0,             
  }      
  Likerts.insert(likertObj)
  
  //update Voices to have count fields
  var setObject = {};
  setObject['likert_'+label+'_counts'] = {yes: 0, no: 0, kinda: 0};
  
  Voices.update(
    {},
    {$set: setObject},
    {multi: true}
  )
  console.log("end addLikertResponse")
}