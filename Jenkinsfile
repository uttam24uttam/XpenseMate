pipeline {
    agent any

    environment {
        BACKEND_IMAGE_NAME = 'uttamhamsaraj24/splitwise-backend'
        FRONTEND_IMAGE_NAME = 'uttamhamsaraj24/splitwise-frontend'
    }
    
    stages {
        stage('Stage 1: Git Clone') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/uttam24uttam/XpenseMate'
            }
        }

        stage('Stage 2: Setup Backend') {
            steps {
                script {
                    // Create secrets.yaml from Jenkins credentials
                    withCredentials([
                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                        string(credentialsId: 'mongo-username', variable: 'MONGO_USER'),
                        string(credentialsId: 'mongo-password', variable: 'MONGO_PASS'),
                        string(credentialsId: 'redis-password', variable: 'REDIS_PASS')
                    ]) {
                        sh '''
                            cat > k8s/secrets.yaml << 'EOF'
                            apiVersion: v1
                            kind: Secret
                            metadata:
                              name: splitwise-secrets
                              namespace: splitwise
                            type: Opaque
                            stringData:
                              JWT_SECRET: "${JWT_SECRET}"
                              MONGO_USERNAME: "${MONGO_USER}"
                              MONGO_PASSWORD: "${MONGO_PASS}"
                              REDIS_PASSWORD: "${REDIS_PASS}"
                            EOF
                            chmod 600 k8s/secrets.yaml
                        '''
                    }
                    
                    sh 'npm install'
                }
            }
        }
        
        stage('Stage 3: Setup Frontend') {
            steps {
                dir('Frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Stage 4: Build and Push Backend Docker Image') {
            steps {
                script {
                    def backendImage = docker.build(env.BACKEND_IMAGE_NAME, '-f Backend/Dockerfile .')
                    docker.withRegistry('', 'docker-hub-cred') {
                        backendImage.push('latest')
                    }
                }
            }
        }

        stage('Stage 5: Build and Push Frontend Docker Image') {
            steps {
                script {
                    def frontendImage = docker.build(env.FRONTEND_IMAGE_NAME, './Frontend')
                    docker.withRegistry('', 'docker-hub-cred') {
                        frontendImage.push('latest')
                    }
                }
            }
        }

        stage('Stage 6: Clean Docker Images') {
            steps {
                sh '''
                    docker container prune -f
                    docker image prune -f
                '''
            }
        }

        stage('Stage 7: Ansible Deployment') {
            steps {
                ansiblePlaybook(
                    inventory: 'ansible/inventory.ini',
                    playbook: 'ansible/deploy.yml',
                    colorized: true,
                    disableHostKeyChecking: true,
                    extras: '-e ansible_python_interpreter=/usr/bin/python3',
                    extraVars: [
                        docker_registry: 'uttamhamsaraj24',
                        image_tag: 'latest',
                        k8s_namespace: 'splitwise',
                        backend_image: "${env.BACKEND_IMAGE_NAME}:latest",
                        frontend_image: "${env.FRONTEND_IMAGE_NAME}:latest"
                    ]
                )
            }
        }

        stage('Stage 8: Verify Kubernetes Deployment') {
            steps {
                sh '''
                    kubectl wait --for=condition=available --timeout=300s \
                        deployment/backend deployment/frontend -n splitwise || true
                    
                    echo "Deployment Status:"
                    kubectl get deployments -n splitwise
                    
                    echo "Pod Status:"
                    kubectl get pods -n splitwise
                    
                    echo "Service Status:"
                    kubectl get svc -n splitwise
                    
                    echo "HPA Status:"
                    kubectl get hpa -n splitwise
                '''
            }
        }
    }
    
    post {
        failure {
            script {
                echo "Build failed. Initiating rollback..."
                try {
                    ansiblePlaybook(
                        inventory: 'ansible/inventory.ini',
                        playbook: 'ansible/rollback.yml',
                        colorized: true,
                        disableHostKeyChecking: true,
                        extras: '-e ansible_python_interpreter=/usr/bin/python3',
                        extraVars: [
                            k8s_namespace: 'splitwise'
                        ]
                    )
                    echo "Rollback completed successfully"
                } catch (Exception e) {
                    echo "Rollback failed: ${e.message}"
                }
            }
        }
        
        success {
            echo "Deployment completed successfully"
        }
    }
}
