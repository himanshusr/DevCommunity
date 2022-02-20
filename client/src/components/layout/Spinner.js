import React, { Fragment } from 'react';
import spinner from './spinner.gif';

const Spinner = () => {
  return (
    <Fragment>
      {/* <i class="fa fa-spinner fa-spin fa-4x"  style={{ width: '200px', margin: 'auto', display: 'block' }}
        alt='Loading...'></i>  */}
      <img
        src={spinner}
        style={{ width: '200px', margin: 'auto', display: 'block' }}
        alt='Loading...'
      />
    </Fragment>
  );
};

export default Spinner;
