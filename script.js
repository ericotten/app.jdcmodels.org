// Utility function to create a checksum for a given string
function createChecksum(str) {
  return Array.from(str)
    .map((char) => char.charCodeAt(0))
    .reduce((sum, charCode) => sum + charCode, 0) % 256; // Simple checksum
}

// Function to encode the data with a checksum
function encodeAccessKey(name, googleDriveLink, telegramLink) {
  // Combine all the data with a special separator
  const combinedData = `${name}||${googleDriveLink}||${telegramLink}`;

  // Create a checksum for the combined data
  const checksum = createChecksum(combinedData);

  // Encode the data along with the checksum
  const encodedData = btoa(combinedData) + '.' + checksum;

  return encodedData;
}

function decodeAccessKey(encodedAccessKey) {
  try {
    // Split the encoded data from the checksum
    const [data, checksum] = encodedAccessKey.split('.');

    // If either part is missing, throw an error
    if (!data || checksum === undefined) {
      throw new Error('Invalid access key format.');
    }

    // Decode the data
    const decodedData = atob(data);

    // Calculate the checksum for the decoded data
    const calculatedChecksum = createChecksum(decodedData);

    // Check if the checksums match
    if (parseInt(checksum, 10) === calculatedChecksum) {
      // If they match, split the decoded data to get the original values
      const [name, googleDriveLink, telegramLink] = decodedData.split('||');
      return { name, googleDriveLink, telegramLink, isValid: true };
    } else {
      // If they don't match, throw an error
        return { isValid: false, error: "Checksum does not match" };
    }
  } catch (error) {
    // If something goes wrong, return an object with isValid set to false and include the error message
    return { isValid: false, error: error.message };
  }
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function switchScreen(hideScreenId, showScreenId) {
    const hideScreen = document.getElementById(hideScreenId);
    const showScreen = document.getElementById(showScreenId);

    // Hide the current screen
    hideScreen.classList.remove('active');
    hideScreen.classList.add('invisible');
        
    // Fade out
    setTimeout(() => {
        hideScreen.classList.remove('invisible');
        showScreen.classList.add('invisible');

        // Fade in
        setTimeout(() => {
            showScreen.classList.remove('invisible');
            showScreen.classList.add('active');
        }, 500); // This should match the duration of the opacity transition
    }, 500); // This should match the duration of the opacity transition
}

// Ensure the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', (event) => {
    // Check if the user is already logged in
    if (checkLogin()) {
        document.getElementById("home-screen").classList.remove("active");
        document.getElementById("dashboard").classList.add("active");

        const accessCode = getCookie("accesscode");
        const res = decodeAccessKey(accessCode);
        updateDashboard(res.name, res.googleDriveLink, res.telegramLink)
    } else {
        // If not logged in, show the home screen
        document.getElementById('home-screen').classList.add('active');
    }


    // Handle "How to Download" text click
    document.getElementById('how-to-download').addEventListener('click', function(e) {
        e.preventDefault();
        switchScreen('home-screen', 'download-instructions');
    });

    // Handle "Back" button click from the download instructions screen
    document.getElementById('back-to-home').addEventListener('click', function() {
        switchScreen('download-instructions', 'home-screen');
    }); 

    // Handle "Join Now" button click
    document.getElementById('join-now').addEventListener('click', function() {
        window.location.href = 'https://forms.gle/9DyiXrwvBsFJBAWr6'; // Redirects to the join form
    });

    // Handle "Log In" button click to show login screen
    document.getElementById('log-in-btn').addEventListener('click', function() {
        switchScreen('home-screen', 'login-screen');
    });

    // Handle "Submit" on the login form
    document.getElementById('submit-login').addEventListener('click', function(e) {
        const invalidCode = document.getElementById("invalid-code");

        e.preventDefault();
        // Here, collect the input values and save them as cookies or in localStorage/sessionStorage
        const accessCode = document.getElementById('login-access-code').value;

        const res = decodeAccessKey(accessCode);
        console.log(res);

        if (res.isValid) {
            invalidCode.classList.add("invisible");

            setCookie("accesscode", accessCode);

            updateDashboard(res.name, res.googleDriveLink, res.telegramLink)
            switchScreen("login-screen", "dashboard")

        } else {
            invalidCode.classList.remove("invisible");
        }
    });

    // Handle the "Refer a Friend" button click
    document.getElementById('refer-a-friend-btn').addEventListener('click', function() {
        switchScreen('dashboard', 'refer-a-friend');
    });

    // Handle the back to dashboard button
    document.getElementById('back-to-dashboard').addEventListener('click', function() {
        switchScreen("refer-a-friend", "dashboard");
    });
});

function checkLogin() {
    return getCookie('accesscode') != "";
}

function signOut() {
    setCookie("accesscode", "");
    switchScreen("dashboard", "home-screen")
}

function updateDashboard(name, driveLink, telegramLink) {
  // Update the welcome text
  const welcomeTextElement = document.getElementById('welcome-text');
  if (welcomeTextElement) {
    welcomeTextElement.innerHTML = `Welcome, ${name}!`;
  }

  // Update the Google Drive link
  const driveLinkElement = document.getElementById('drive-link');
  if (driveLinkElement) {
    driveLinkElement.setAttribute('href', driveLink);
  }

  // Update the Telegram link
  const telegramLinkElement = document.getElementById('telegram-link');
  if (telegramLinkElement) {
    telegramLinkElement.setAttribute('href', telegramLink);
  }

  // Update the Telegram link in referral dashboard
  const telegramLinkElement2 = document.getElementById('telegram-link-2');
  if (telegramLinkElement2) {
    telegramLinkElement2.setAttribute('href', telegramLink);
  }
}
