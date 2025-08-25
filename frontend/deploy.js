#!/usr/bin/env node

/**
 * Deployment script for the Recruitment AI Full Platform
 * 
 * This script helps with deploying the application to Vercel
 * It checks for required environment variables and provides guidance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if Vercel CLI is installed
const checkVercelCLI = () => {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Check if .env.local exists and contains required variables
const checkEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
  const missingVars = [];

  for (const variable of requiredVars) {
    if (!envContent.includes(`${variable}=`)) {
      missingVars.push(variable);
    }
  }

  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }

  return true;
};

// Check if vercel.json exists
const checkVercelConfig = () => {
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  return fs.existsSync(vercelConfigPath);
};

// Main function
const deploy = async () => {
  console.log('🚀 Starting deployment process for Recruitment AI Full Platform');

  // Check prerequisites
  if (!checkVercelCLI()) {
    console.error('❌ Vercel CLI not found. Please install it with: npm i -g vercel');
    process.exit(1);
  }

  if (!checkEnvFile()) {
    console.error('❌ Please fix the environment variables issues before deploying.');
    process.exit(1);
  }

  if (!checkVercelConfig()) {
    console.error('❌ vercel.json configuration file not found!');
    process.exit(1);
  }

  console.log('✅ All prerequisites checked!');

  // Deploy to Vercel
  try {
    console.log('🔄 Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('✅ Deployment successful!');
    console.log('🌐 Your application should be available at https://recruitmentaiagent.vercel.app');
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
};

// Run the deployment
deploy().catch(console.error);