


const selectorColor = () => {
    const selectorList = document.querySelector('#searchSelector');
    // console.log(selectorList);

    selectorList.addEventListener('change', () => {
        console.log(selectorList.selectedIndex);
    });


}

selectorColor();

const teachersSlide = () => {
    const carouselSlide = document.querySelector('.carousel-slide');
    const carouselDivs = document.querySelectorAll('[name="teacherDivSlide"]');
    
    //buttons
    const prevBtn = document.querySelector('#prevBtn');
    const nextBtn = document.querySelector('#nextBtn');
 
    //counter
    let counter = 1;
    let size = carouselSlide.clientWidth/5;


    
    carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;

    //Button listeners
    window.addEventListener('resize', () => {
        size = carouselSlide.clientWidth/5;
        carouselSlide.style.transition = "none";
        carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
    });
    

    nextBtn.addEventListener('click', () => {
        if (counter >= carouselDivs.length - 1 ) return;
         carouselSlide.style.transition = "transform 0.4s ease-in-out";
         counter++;
         carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
             });
    
    prevBtn.addEventListener('click', () => {
    if (counter <= 0 ) return;
     carouselSlide.style.transition = "transform 0.4s ease-in-out";
    counter--;
     carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
          });
      
          carouselSlide.addEventListener('transitionend', ()=> {
                 if(carouselDivs[counter].id === 'lastClone') {
                     carouselSlide.style.transition = 'none';
                     counter = carouselDivs.length - 2;
                     carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
                 }

                 if(carouselDivs[counter].id === 'firstClone') {
                    carouselSlide.style.transition = 'none';
                    counter = carouselDivs.length - counter;
                    carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
                 }
          });
             
}

teachersSlide();


const reviewsSlide = () => {
    const carouselSlide = document.querySelector('.carousel-slide-review');
    const carouselDivs = document.querySelectorAll('[name="reviewDivSlide"]');
    
    //buttons
    const prevBtn = document.querySelector('#prevBtnRev');
    const nextBtn = document.querySelector('#nextBtnRev');
 
    //counter
    let counter = 1;
    let size = carouselSlide.clientWidth/5;
    
    carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;

    //Button listeners
    window.addEventListener('resize', () => {
        size = carouselSlide.clientWidth/5;
        carouselSlide.style.transition = "none";
        carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
    });
    

    nextBtn.addEventListener('click', () => {
        if (counter >= carouselDivs.length - 1 ) return;
         carouselSlide.style.transition = "transform 0.4s ease-in-out";
         counter++;
         carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
             });
    
    prevBtn.addEventListener('click', () => {
    if (counter <= 0 ) return;
     carouselSlide.style.transition = "transform 0.4s ease-in-out";
    counter--;
     carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
          });
      
          carouselSlide.addEventListener('transitionend', ()=> {
                 if(carouselDivs[counter].id === 'lastCloneReview') {
                     carouselSlide.style.transition = 'none';
                     counter = carouselDivs.length - 2;
                     carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
                 }

                 if(carouselDivs[counter].id === 'firstCloneReview') {
                    carouselSlide.style.transition = 'none';
                    counter = carouselDivs.length - counter;
                    carouselSlide.style.transform = `translateX(${(-size * counter)}px)`;
                 }
          });
             
}

reviewsSlide();