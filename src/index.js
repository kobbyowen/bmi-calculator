const maleButton = document.getElementById("male")
const femaleButton = document.getElementById("female")

maleButton.addEventListener('click',(e)=>{
    maleButton.classList.add("active-gender")
    femaleButton.classList.remove("active-gender")
})

femaleButton.addEventListener('click',(e)=>{
    femaleButton.classList.add("active-gender")
    maleButton.classList.remove("active-gender")
    
})