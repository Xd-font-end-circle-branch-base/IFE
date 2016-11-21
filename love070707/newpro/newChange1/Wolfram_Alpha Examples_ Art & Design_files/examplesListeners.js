// Listeners for Examples Subpages

//  used to reveal popover window for all the example category links on hover
$('.popoverButton, .popup').hover( 
    function() {
        $('.popoverButton').addClass('fakeHover');
        $('.popup').show();
    },
    function() {
        $('.popoverButton').removeClass('fakeHover');
        $('.popup').hide();
}
);

// Hide all the reference link boxes except for one random one
/*  If you wish to re-enable this, first add .blogPosts.referenceLink { display:none; } to examples2.css
if($('.blogPosts.referenceLink').length>0) {
    var numRefs = $('.blogPosts.referenceLink').length;
    var randomRef = Math.floor((Math.random()*numRefs));
    $( $('.blogPosts.referenceLink')[randomRef] ).show();
}*/

//Pick a random subset for the related blogs of length 6 to show  
var relatedBlogs = $($('.blogPosts .contents')[0]).children();
var numBlogs = (relatedBlogs.length);
var numNeeded = 6;
for(var i=0; i<(relatedBlogs.length); i++) {
    var probablity = Math.floor( (numNeeded / numBlogs)*100);
    var random = Math.floor((Math.random()*100)+1);
    if( random<=probablity ) {
        $( relatedBlogs[i] ).show();
        numNeeded--;
    } 
    numBlogs--;
}
