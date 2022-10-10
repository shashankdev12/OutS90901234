function generateLicence()
{
  var chars1 = Date.now();
  var chars = "board"+chars1.toString();
  var string_length = 15;
  var randomstring = '';
  for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
  }
  $("#generatedLicence").val(randomstring) ;
}



function updateLicenceStatus(id,status,webURL)
{
    $.ajax({
      type: "POST",
      url: webURL+'updateLcsStatus',
      data: 'userId='+id+"&status="+status,
      success: function(data)
      {
        location.reload();
      }
    })
}
