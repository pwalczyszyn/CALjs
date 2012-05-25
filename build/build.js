({
    baseUrl:"../src",
    paths:{
        "almond":"../build/almond-0.0.3",
        "text":"../build/text-1.0.8"
    },
    include:["almond", "CalJS"],
    preserveLicenseComments:true,
    out:"caljs-built.js",
    wrap:{
        startFile:"wrap-start.frag",
        endFile:"wrap-end.frag"
    },
    optimize:"none"
})