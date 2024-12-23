import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, TextField, Button, Grid } from '@mui/material';
import axios from 'axios';

const RegisterForm: React.FC = () => {
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
      password: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      // Add validation for other fields as needed
    }),
    onSubmit: async (values) => {
      try {
        const response = await axios.post('/api/register', values);
        console.log('Registration successful:', response.data);
      } catch (error) {
        console.error('Registration failed:', error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 600, margin: 'auto' }}>
      <Grid container spacing={2}>
        {Object.keys(formik.initialValues).map((field) => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              fullWidth
              label={field.replace(/([A-Z])/g, ' $1').trim()}
              name={field}
              value={(formik.values as any)[field]}
              onChange={formik.handleChange}
              error={Boolean(formik.errors[field as keyof typeof formik.errors] && formik.touched[field as keyof typeof formik.touched])}
              helperText={(formik.errors as any)[field]}
            />
          </Grid>
        ))}
      </Grid>
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Register
      </Button>
    </Box>
  );
};

export default RegisterForm;
