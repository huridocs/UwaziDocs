/* eslint-disable max-statements */
import React, { useEffect, useState } from 'react';
import api from 'app/utils/api';
import { useRevalidator } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { RequestParams } from 'app/utils/RequestParams';
import { notificationAtom } from 'app/V2/atoms';
import {
  Button,
  Card,
  CopyValueInput,
  PasswordConfirmModal,
  Sidepanel,
} from 'app/V2/Components/UI';
import { Translate } from 'app/I18N';
import loadable from '@loadable/component';
import { InputField } from 'app/V2/Components/Forms';

const QRCodeSVG = loadable(
  async () => import(/* webpackChunkName: "qrcode.react" */ 'qrcode.react'),
  {
    resolveComponent: components => components.QRCodeSVG,
  }
);

interface TwoFactorSetupProps {
  closePanel: () => void;
  isOpen?: boolean;
}

const TwoFactorSetup = ({ closePanel, isOpen }: TwoFactorSetupProps) => {
  const [token, setToken] = useState('');
  const [_secret, setSecret] = useState('');
  const [_otpauth, setOtpauth] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(false);
  const setNotifications = useSetAtom(notificationAtom);
  const revalidator = useRevalidator();
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (isOpen && !_secret) {
      api
        .post('auth2fa-secret')
        .then((resp: Response) => resp.json)
        .then(({ otpauth, secret }: { otpauth: string; secret: string }) => {
          setSecret(secret);
          setOtpauth(otpauth);
        })
        .catch((error: Error) => {
          throw error;
        });
    }
  }, [isOpen, _secret]);

  const tokenChange = (value: string) => {
    setToken(value);
    if (tokenError) {
      setTokenError(false);
    }
  };

  const enable2fa = async (currentPassword: string) => {
    try {
      await api.post('auth2fa-enable', new RequestParams({ token, currentPassword }));
      revalidator.revalidate();
      closePanel();
      setNotifications({
        type: 'success',
        text: <Translate>2FA Enabled</Translate>,
      });
    } catch (error) {
      if (error.status === 409) {
        setTokenError(true);
      }
      throw error;
    }
  };

  return (
    <>
      <Sidepanel
        title={<Translate className="uppercase">Two-Factor Authentication</Translate>}
        isOpen={isOpen}
        closeSidepanelFunction={closePanel}
        size="large"
        withOverlay
      >
        <Sidepanel.Body>
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            <Card className="mb-4 sm:col-span-2" title={<Translate>Using Authenticator</Translate>}>
              <ol className="list-decimal list-inside">
                <li className="mb-4">
                  <Translate>
                    Download a third-party authenticator app from your mobile store.
                  </Translate>
                  &nbsp;
                  <span no-translate className="italic text-gray-500">
                    (Google Authenticator, LastPass Authenticator, Microsoft Authenticator, Authy,
                    etc.)
                  </span>
                </li>
                <li className="mb-4">
                  <Translate>
                    Add an account to the app by scanning the provided QR code with your mobile
                    device or by inserting the provided key.
                  </Translate>
                </li>
              </ol>
              <p>
                <Translate className="italic text-gray-500">
                  Instructions on how to achieve this will vary according to the app used, please
                  refer to the app's documentation.
                </Translate>
              </p>
            </Card>
            <Card className="mb-4 sm:col-span-1" title={<Translate>QR Code</Translate>}>
              <div className="flex justify-center">
                <QRCodeSVG
                  value={_otpauth}
                  level="Q"
                  includeMargin={false}
                  size={180}
                  bgColor="white"
                  fgColor="black"
                />
              </div>
            </Card>
            <Card className="mb-4 sm:col-span-3" title={<Translate>Secret keys</Translate>}>
              <CopyValueInput
                value={_secret}
                className="mb-4 w-full"
                label={
                  <>
                    <Translate className="block">
                      You can also enter this secret key into your Authenticator app.
                    </Translate>
                    <Translate className="block italic text-gray-500">
                      *please keep this key secret and don't share it.
                    </Translate>
                  </>
                }
                id="authenticator-secret"
              />
              <InputField
                onChange={e => tokenChange(e.target.value)}
                id="authenticator-token"
                label={
                  <Translate className="font-bold">
                    Enter the 6-digit verification code generated by your Authenticator app
                  </Translate>
                }
                name="token"
                autoComplete="off"
                value={token}
                hasErrors={tokenError}
              />
              {tokenError && (
                <p className="mt-2 text-sm text-error-600">
                  <Translate>The token does not validate against the secret key</Translate>
                </p>
              )}
            </Card>
          </div>
        </Sidepanel.Body>
        <Sidepanel.Footer className="px-4 py-3">
          <div className="flex gap-2 w-full">
            <Button styling="light" onClick={closePanel} className="grow">
              <Translate>Cancel</Translate>
            </Button>
            <Button className="grow" disabled={!token} onClick={() => setConfirmPassword(true)}>
              <Translate>Enable</Translate>
            </Button>
          </div>
        </Sidepanel.Footer>
      </Sidepanel>
      {confirmPassword && (
        <PasswordConfirmModal
          onCancelClick={() => setConfirmPassword(false)}
          onAcceptClick={async value => {
            setConfirmPassword(false);
            await enable2fa(value);
          }}
        />
      )}
    </>
  );
};

export { TwoFactorSetup };
