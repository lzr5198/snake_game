const Registration = (function() {
    // This function sends a register request to the server
    // * `username`  - The username for the sign-in
    // * `avatar`    - The avatar of the user
    // * `name`      - The name of the user
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const register = function(username, avatar, name, password, onSuccess, onError) {

        //
        // A. Preparing the user data
        //
        const obj = {"username":username,"avatar":avatar,"name":name,"password":password};
        const JSON_str = JSON.stringify(obj);
 
        //
        // B. Sending the AJAX request to the server
        // F. Processing any error returned by the server
        // J. Handling the success response from the server
        //
        fetch("/register", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON_str
         })
            .then((res) => res.json() )
            .then((json) => {
                if (json.status == "success") {
                    /* Run the onSuccess() callback */
                    onSuccess();
                }
                else if (onError) onError(json.error);
                // console.log("Successful!");
            })
            .catch((err) => {
                console.log("Error!");
            });

    };

    return { register };
})();
