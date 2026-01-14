import axios from "axios";
import { showAlert } from "./alert";


// type is either data or password
export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateMe';
        const response = await axios.patch(url, data);
        if (response.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} UPDATED SUCCESSFULLY!`);

        }
    } catch (error) {
        showAlert('error', error.response.data.message)

    }

}