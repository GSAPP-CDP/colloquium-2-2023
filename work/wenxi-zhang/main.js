$(document).ready(function(){
    // 当点击导航链接时
    $('.navbar-links a').on('click', function(event) {
      // 阻止默认的跳转行为
    event.preventDefault();
    
      // 获取目标元素的位置
    var target = $(this.getAttribute('href'));
    if(target.length) {
        // 平滑滚动到目标位置
        $('html, body').stop().animate({
        scrollTop: target.offset().top
        }, 1000);
    }
    });
});

$(document).ready(function(){
    // 假设你有一个网页列表
    var pages = [
"file:///Users/kiarazhang/Documents/2023CDP-summer/wenxi-zhang%E5%89%AF%E6%9C%AC/nyc_film_mapping_1.html",
      // ... 其他网页链接
    ];
    var currentIndex = 0;

    // 上一个预览
    $('#prevBtn').click(function() {
if (currentIndex > 0) {
        currentIndex--;
        $('#previewIframe').attr('src', pages[currentIndex]);
}
    });

    // 下一个预览
    $('#nextBtn').click(function() {
if (currentIndex < pages.length - 1) {
        currentIndex++;
        $('#previewIframe').attr('src', pages[currentIndex]);
}
    });
});