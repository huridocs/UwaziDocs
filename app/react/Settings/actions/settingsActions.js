import { notify } from 'app/Notifications';
import { t } from 'app/I18N';
import SettingsAPI from 'app/Settings/SettingsAPI';

const saveSettings = data => dispatch => SettingsAPI.save(data)
.then(() => {
  dispatch(notify(t('System', 'Settings updated'), 'success'));
});

export default saveSettings;
