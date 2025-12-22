//Jenkinsfile pipeline

pipeline {
    agent any

    environment {
        BACKEND_IMAGE_NAME = 'uttamhamsaraj24/splitwise-backend'
        FRONTEND_IMAGE_NAME = 'uttamhamsaraj24/splitwise-frontend'
    }
    
    stages {
        stage('Git Clone') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: 'https://github.com/uttam24uttam/XpenseMate'
            }
        }

        stage('Setup Backend') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Setup Frontend') {
            steps {
                dir('Frontend') {
                    sh 'npm install'
                }
            }
        }
                            
        stage('Build and Push Backend Docker Image') {
            steps {
                script {
                    def backendImage = docker.build(env.BACKEND_IMAGE_NAME, '-f Backend/Dockerfile .')
                    docker.withRegistry('', 'docker-hub-cred') {
                        backendImage.push('latest')
                    }
                }
            }
        }

        stage('Build and Push Frontend Docker Image') {
            steps {
                script {
                    def frontendImage = docker.build(env.FRONTEND_IMAGE_NAME, './Frontend')
                    docker.withRegistry('', 'docker-hub-cred') {
                        frontendImage.push('latest')
                    }
                }
            }
        }

        stage('Clean Docker Images') {
            steps {
                sh '''
                    docker container prune -f
                    docker image prune -f
                '''
            }
        }

        stage('Ansible Deployment') {
            steps {
                withCredentials([
                    string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                    string(credentialsId: 'mongo-username', variable: 'MONGO_USER'),
                    string(credentialsId: 'mongo-password', variable: 'MONGO_PASS'),
                    string(credentialsId: 'redis-password', variable: 'REDIS_PASS')
                ]) {
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
                            frontend_image: "${env.FRONTEND_IMAGE_NAME}:latest",
                            // Secrets 
                            secret_jwt: "${JWT_SECRET}",
                            secret_mongo_user: "${MONGO_USER}",
                            secret_mongo_pass: "${MONGO_PASS}",
                            secret_redis_pass: "${REDIS_PASS}"
                        ]
                    )
                }
            }
        }

        stage('Verify Kubernetes Deployment') {
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
                echo "Build failed, rollback"
                ansiblePlaybook(
                    inventory: 'ansible/inventory.ini',
                    playbook: 'ansible/rollback.yml',
                    extraVars: [ k8s_namespace: 'splitwise' ]
                )
            }
        }
        success {
            echo "Deployment successful"
        }
    }
}