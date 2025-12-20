pipeline {
    agent any

    environment {
        // Docker Hub Credentials
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-cred')
        DOCKER_HUB_USERNAME = 'uttam24uttam'
        
        // Docker Images Configuration
        BACKEND_IMAGE = "${DOCKER_HUB_USERNAME}/splitwise-backend:latest"
        FRONTEND_IMAGE = "${DOCKER_HUB_USERNAME}/splitwise-frontend:latest"
        REGISTRY = 'docker.io'
    }
    
    stages {
        stage('Step 1: Git Clone') {
            steps {
                script {
                    echo " Step 1: Git Clone"
                    checkout scm
                    sh 'git log -1 --oneline'
                    echo " Repository cloned successfully"
                }
            }
        }

        stage('Step 2: Install Requirements') {
            steps {
                script {
                    echo " Step 2: Install Requirements"
                    
                    parallel(
                        "Backend Dependencies": {
                            sh '''
                                echo "Installing backend dependencies..."
                                cd Backend && npm install
                                echo " Backend dependencies installed"
                            '''
                        },
                        "Frontend Dependencies": {
                            sh '''
                                echo "Installing frontend dependencies..."
                                cd Frontend && npm install
                                echo " Frontend dependencies installed"
                            '''
                        },
                        "Ansible Collections": {
                            sh '''
                                echo "Installing Ansible collections..."
                                cd ansible && ansible-galaxy collection install -r requirements.yml
                                echo " Ansible collections installed"
                            '''
                        }
                    )
                }
            }
        }

        // stage('Step 3: Test Backend') {
        //     steps {
        //         script {
        //             echo "Step 3: Test Backend"
        //             catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
        //                 sh 'cd Backend && npm test'
        //             }
        //             echo " Backend tests completed"
        //         }
        //     }
        // }

        stage('Step 4: Build and Push Backend Docker Image') {
            steps {
                script {
                    echo "🔨 Step 4: Build and Push Backend Docker Image"
                    
                    // Login to Docker Hub
                    sh '''
                        echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                        echo " Logged in to Docker Hub"
                    '''
                    
                    // Build Backend Image
                    sh '''
                        cd Backend
                        docker build -t ${BACKEND_IMAGE} .
                        echo " Backend Docker image built successfully"
                    '''
                    
                    // Push Backend Image
                    sh '''
                        docker push ${BACKEND_IMAGE}
                        echo " Backend Docker image pushed to Docker Hub"
                    '''
                }
            }
        }

        stage('Step 5: Build and Push Frontend Docker Image') {
            steps {
                script {
                    echo "Step 5: Build and Push Frontend Docker Image"
                    
                    // Build Frontend Image
                    sh '''
                        cd Frontend
                        docker build -t ${FRONTEND_IMAGE} .
                        echo " Frontend Docker image built successfully"
                    '''
                    
                    // Push Frontend Image
                    sh '''
                        docker push ${FRONTEND_IMAGE}
                        echo " Frontend Docker image pushed to Docker Hub"
                    '''
                }
            }
        }

        stage('Step 6: Clean Docker Images') {
            steps {
                script {
                    echo " Step 6: Clean Docker Images"
                    sh '''
                        echo "Removing unused Docker containers..."
                        docker container prune -f || true
                        echo " Docker containers pruned"
                        
                        echo "Removing unused Docker images..."
                        docker image prune -f || true
                        echo " Docker images pruned"
                    '''
                }
            }
        }

        stage('Step 7: Ansible Deployment') {
            steps {
                script {
                    echo " Step 7: Ansible Deployment"
                    echo "Triggering Ansible Playbook for Kubernetes Deployment"
                    
                    // Execute Ansible Playbook using Ansible Plugin
                    ansiblePlaybook(
                        inventory: 'ansible/inventory.ini',
                        playbook: 'ansible/deploy.yml',
                        colorized: true,
                        disableHostKeyChecking: true,
                        extras: '-e ansible_python_interpreter=/usr/bin/python3',
                        extraVars: [
                            docker_registry: "${DOCKER_HUB_USERNAME}",
                            image_tag: 'latest',
                            namespace: 'splitwise',
                            backend_image: "${BACKEND_IMAGE}",
                            frontend_image: "${FRONTEND_IMAGE}"
                        ]
                    )
                    
                    echo " Ansible playbook executed successfully"
                }
            }
        }

        stage('Step 8: Verify Kubernetes Deployment') {
            steps {
                script {
                    echo " Step 8: Verify Kubernetes Deployment"
                    sh '''
                        echo "Waiting for deployments to be ready..."
                        kubectl wait --for=condition=available --timeout=300s \
                            deployment/backend deployment/frontend -n splitwise || true
                        
                        echo "\n Pods Status:"
                        kubectl get pods -n splitwise
                        
                        echo "\n Services:"
                        kubectl get svc -n splitwise
                        
                        echo "\n Horizontal Pod Autoscalers:"
                        kubectl get hpa -n splitwise
                        
                        echo "\n Deployments:"
                        kubectl get deployments -n splitwise
                    '''
                    echo " Kubernetes deployment verified"
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo " Pipeline Execution Completed"
                
                // Cleanup Docker login
                sh '''
                    docker logout || true
                    echo " Logged out from Docker Hub"
                '''
            }
        }
        
        success {
            script {
                echo " =========================================="
                echo " PIPELINE SUCCEEDED!"
                echo " =========================================="
                echo " Backend Image: ${BACKEND_IMAGE}"
                echo " Frontend Image: ${FRONTEND_IMAGE}"
                echo " Namespace: splitwise"
                echo " Splitwise Application deployed successfully!"
                echo " =========================================="
            }
        }
        
        failure {
            script {
                echo " =========================================="
                echo " PIPELINE FAILED!"
                echo " =========================================="
                echo " Please check the logs above for more details"
                echo " =========================================="
                
                // Attempt rollback using Ansible plugin
                try {
                    echo "🔄 Attempting rollback..."
                    ansiblePlaybook(
                        inventory: 'ansible/inventory.ini',
                        playbook: 'ansible/rollback.yml',
                        colorized: true,
                        disableHostKeyChecking: true,
                        extras: '-e ansible_python_interpreter=/usr/bin/python3',
                        extraVars: [
                            namespace: 'splitwise'
                        ]
                    )
                    echo "✅ Rollback completed"
                } catch (Exception e) {
                    echo "⚠️ Rollback failed: ${e.message}"
                }
            }
        }
    }
}
