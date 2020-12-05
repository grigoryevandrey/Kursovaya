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

    document.addEventListener('click', event => {
        if (!event.target.matches("ul") && !event.target.matches("a") && !event.target.matches("div.burger") && !event.target.matches("div.line1") && !event.target.matches("div.line2") && !event.target.matches("div.line3") && nav.classList.contains("nav-active")) {
            navLinks.forEach((link) => {
                if (link.style.animation) {
                link.style.animation = '';
            }
        });
            actualNav.classList.toggle('nav-opa');
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');

        }
    })


   
}

navSlide();


const navChangeIfLogged = () => {
    const showIfLogged = document.querySelectorAll('#showIfLogged');
    const showIfNotLogged = document.querySelectorAll('#showIfNotLogged');


    if (isOk) {
        showIfLogged.forEach((item) => {
            item.classList.remove('hide');
        });
        showIfNotLogged.forEach((item) => {
            item.classList.add('hide');
        });
    } else {
        showIfLogged.forEach((item) => {
            item.classList.add('hide');
        });
        showIfNotLogged.forEach((item) => {
            item.classList.remove('hide');
        });
    }
}

navChangeIfLogged();

