import React from 'react';
import { connect } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { omit } from 'lodash';

const defaultProps = {
  disabled: false,
  onClick: (_e: any) => {},
  confirmTitle: '',
  confirmMessage: '',
};

type I18NLinkProps = typeof defaultProps & {
  to: string;
  disabled: boolean;
  onClick: (_e: any) => void;
  confirmTitle: string;
  confirmMessage: string;
  mainContext: { confirm: Function };
  activeclassname: string;
};

const I18NLink = (props: I18NLinkProps) => {
  const { to = '/', disabled, confirmTitle, confirmMessage, onClick } = props;

  const navigate = useNavigate();

  const onClickHandler = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (disabled) return;

    if (onClick && confirmTitle) {
      props.mainContext.confirm({
        accept: () => {
          onClick(e);
          navigate(to);
        },
        title: confirmTitle,
        message: confirmMessage,
      });
    }

    if (onClick) {
      onClick(e);
      navigate(to);
    }

    navigate(to);
  };

  const newProps = omit(props, [
    'dispatch',
    'onClick',
    'confirmTitle',
    'confirmMessage',
    'to',
    'activeclassname',
  ]);

  return (
    <NavLink
      end
      to={props.to}
      onClick={onClickHandler}
      className={({ isActive }) => (isActive ? props.activeclassname : undefined)}
      {...newProps}
    />
  );
};

export function mapStateToProps({ locale }: { locale?: string }, ownProps: any) {
  return { to: `/${locale || ''}/${ownProps.to}`.replace(/\/+/g, '/') };
}

export type { I18NLinkProps };
export { I18NLink };
export default connect(mapStateToProps)(I18NLink);
