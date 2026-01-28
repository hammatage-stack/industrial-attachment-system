#!/bin/bash

# Script to create ECR repositories for the Industrial Attachment System
# Run this once to set up your ECR repositories

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"

echo "=================================================="
echo "Creating ECR Repositories"
echo "AWS Region: ${AWS_REGION}"
echo "AWS Account: ${AWS_ACCOUNT_ID}"
echo "=================================================="

# Create backend repository
echo ""
echo "Creating backend repository..."
aws ecr create-repository \
    --repository-name industrial-attachment-backend \
    --region ${AWS_REGION} \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    --tags Key=Project,Value=IndustrialAttachment Key=Component,Value=Backend \
    2>/dev/null || echo "Repository already exists"

# Set lifecycle policy for backend
echo "Setting lifecycle policy for backend..."
aws ecr put-lifecycle-policy \
    --repository-name industrial-attachment-backend \
    --region ${AWS_REGION} \
    --lifecycle-policy-text '{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}'

# Create frontend repository
echo ""
echo "Creating frontend repository..."
aws ecr create-repository \
    --repository-name industrial-attachment-frontend \
    --region ${AWS_REGION} \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    --tags Key=Project,Value=IndustrialAttachment Key=Component,Value=Frontend \
    2>/dev/null || echo "Repository already exists"

# Set lifecycle policy for frontend
echo "Setting lifecycle policy for frontend..."
aws ecr put-lifecycle-policy \
    --repository-name industrial-attachment-frontend \
    --region ${AWS_REGION} \
    --lifecycle-policy-text '{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}'

echo ""
echo "=================================================="
echo "✅ ECR Repositories Created Successfully!"
echo "=================================================="
echo ""
echo "Backend Repository URI:"
echo "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/industrial-attachment-backend"
echo ""
echo "Frontend Repository URI:"
echo "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/industrial-attachment-frontend"
echo ""
echo "=================================================="
echo "Next Steps:"
echo "1. Add these secrets to your GitHub repository:"
echo "   - AWS_ACCOUNT_ID"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo ""
echo "2. Update .github/workflows/build-and-push-ecr.yml with your AWS region"
echo ""
echo "3. Push code to trigger the pipeline"
echo "=================================================="
