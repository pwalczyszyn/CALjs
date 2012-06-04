({
    baseUrl:"../src",
    paths:{
        "almond":"../build/almond",
        "text":"../build/text"
    },
    include:["almond", "Calendar"],
    preserveLicenseComments:true,
    out:"caljs-built.js",
    wrap:{
        startFile:"wrap-start.frag",
        endFile:"wrap-end.frag"
    },
    optimize:"none"
})