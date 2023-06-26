export default function AvatarUrl(name = "nabin", gender = "F") {
    return `https://api.dicebear.com/5.x/micah/svg?seed=${name}&size=48&scale=100&radius=20${gender == "M"
            ? "&hair=dougFunny,fonze,mrClean,mrT,turban&facialHairProbability=50&facialHair=scruff&earringsProbability=0"
            : "&hair=dannyPhantom,full,pixie&facialHairProbability=0&earringsProbability=80"
        }&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear&mouth=laughing,pucker,smile,smirk&baseColor=ac6651,f9c9b6`;
}
