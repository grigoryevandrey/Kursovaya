const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const actualNav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
            //toggle nav
        actualNav.classList.toggle('nav-opa');
        nav.classList.toggle('nav-active');
        //animate links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
            link.style.animation = '';
        }
        else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index/5 + 0.3}s`;
        }
       });

       //burger animation
       burger.classList.toggle('toggle');
    });


   
}

navSlide();