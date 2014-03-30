var konami_sequence = [ 38, 38, 40, 40, 37, 39, 37, 39, 66, 65 ];
var timeout = 5000;

function konamiAction(doc, action) {
    this.doc = doc;
    this.action = action;
    this.last_konami_char = -1;
    this.konami_clear_timer = null;

    this.listener = function(e) {
        var evt = (e) ? e : ((window.event) ? window.event : null);
        if (evt) {
            var charCode = (evt.charChode) ? evt.charCode : 
                        ((evt.keyCode) ? evt.keyCode : 
                             ((evt.which) ? evt.which : 0));
        
             switch(charCode) {
            case 38: 
            case 40: 
            case 37: 
            case 39: 
            case 66: 
            case 65:
                {

                    // Clear the timer!
                    if (this.konami_clear_timer != null)
                        clearTimeout(this.konami_clear_timer);

                    var next = this.last_konami_char+1;
                    console.log("[",this,"] found: ", charCode, "\texpecting: ", konami_sequence[next]);
                    if (konami_sequence[next] == charCode && charCode == 65) {
                        console.log("   DONE! ", this.action);
                        this.action();
                        this.last_konami_char = -1;
                    } else if (konami_sequence[next] == charCode) {
                        console.log("   still in sequence");
                        this.konami_clear_timer = setTimeout(function() { this.last_konami_char = -1; }, 
                                                             timeout);
                        this.last_konami_char = next;

                        // Don't propogate
                        // IE solution
                        evt.cancelBubble = true;
                        evt.returnValue = false;

                        // Other browsers
                        if (evt.stopPropagation) {
                            evt.stopPropagation();
                            evt.preventDefault();
                        }
                        return false;

                    } else {
                        console.log("   WRONG");
                        this.last_konami_char = -1;
                    }
                    break;
                }
            default: this.last_konami_char = -1; break;
            }
        }
    }
}
