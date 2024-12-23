import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, TextField, Button, Grid, Typography } from '@mui/material';
import { registerUser } from './api';

const Register: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      email: '',
      role: '',
      degree: '',
      specialization: '',
      phoneNumber: '',
      certifications: '',
      internshipDetails: '',
      coursesCompleted: '',
      linkedInProfileLink: '',
      programmingLanguagesKnown: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      phoneNumber: Yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    }),
    onSubmit: async (values) => {
      try {
        const data = await registerUser(values);
        console.log('Registration successful:', data);
        alert('Registration Successful! Please login.');
      } catch (err) {
        console.error('Registration failed:', err);
        alert('Registration failed. Please try again.');
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {Object.keys(formik.initialValues).map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                label={field.replace(/([A-Z])/g, ' $1').trim()}
                name={field}
                value={(formik.values as any)[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText={(formik.touched as any)[field] && (formik.errors as any)[field]}
              />
            </Grid>
          ))}
        </Grid>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </form>
    </Box>
  );
};

export default Register;
