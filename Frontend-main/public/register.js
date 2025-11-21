// Define password requirements
const passwordRequirements = {
    minLength: 8,
    maxLength: 20,
    requireUpperCase: true,
    requireLowerCase: true,
    requireNumber: true,
    requireSpecialChar: true
};

// Function to validate the password based on the specified requirements
function validatePassword(password, requirements) {
    const { minLength, maxLength, requireUpperCase, requireLowerCase, requireNumber, requireSpecialChar } = requirements;

    // Check length
    if (password.length < minLength || password.length > maxLength) {
        return false;
    }

    // Check for at least one uppercase letter
    if (requireUpperCase && !/[A-Z]/.test(password)) {
        return false;
    }

    // Check for at least one lowercase letter
    if (requireLowerCase && !/[a-z]/.test(password)) {
        return false;
    }

    // Check for at least one number
    if (requireNumber && !/\d/.test(password)) {
        return false;
    }

    // Check for at least one special character
    if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return false;
    }

    // If all checks passed
    return true;
}

// Register form submission handler
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    const password = document.getElementById('password').value;
    const messageElement = document.createElement('p');  // Create a message element for feedback

    // Prevent the form from submitting initially
    event.preventDefault();

    // Validate the password
    if (!validatePassword(password, passwordRequirements)) {
        messageElement.textContent = "Make sure your password has 8 - 20 characters, at least one uppercase letter, at least one lowercase letter, at least one number, and at least one special character.";
            // Style the message element
            messageElement.style.color = "white";
            messageElement.style.backgroundColor = "red";
            messageElement.style.padding = "10px";
            messageElement.style.borderRadius = "5px";
            messageElement.style.fontWeight = "bold";
            messageElement.style.textAlign = "center";
            messageElement.style.marginTop = "20px";
            messageElement.style.width = "50%";
            messageElement.style.boxSizing = "border-box";
        document.body.appendChild(messageElement);
    }
});